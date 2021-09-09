import React, { useState, useEffect } from 'react';
import {
  Jumbotron,
  Container,
  Col,
  Form,
  Button,
  Card,
  CardColumns,
  Row,
} from 'react-bootstrap';


import { gql, useQuery, useMutation } from '@apollo/client';
//import { useMutation } from '@apollo/client';
import { SAVE_PLANT, JON_PLANT } from '../utils/mutations';
import { QUERY_PLANT } from '../utils/queries';
import { savePlantIds, getSavedPlantIds } from '../utils/localStorage';

import Auth from '../utils/auth';

import './Style.css'
import plant from './plantData'; 

const SearchPlants = () => {
  console.log('render search plants')
  const { loading, data } = useQuery(QUERY_PLANT); 
    
  const [searchedPlants, setSearchedPlants] = useState([]);

  const [savedPlantIds, setSavedPlantIds] = useState(getSavedPlantIds());

  const [savePlant, { error }] = useMutation(SAVE_PLANT);

  useEffect(() => {
    return () => savePlantIds(savedPlantIds);
  });

  const checkTrue = (thing) => {
    if(thing) {
      return `Yes`
    } else
    return `No`
  }


  const [jonSavePlant, { data: savePlantData }] = useMutation(JON_PLANT)
  const user = Auth.getProfile()

  console.log('userrrr? ', user)

  // create function to handle saving a plant to our user
  const handleSavePlant = async (plantId) => {
    // find the plant in `searchedPlants` state by the matching id
    const plantToSave = searchedPlants.find((plant) => plant.plantId === plantId);

    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await savePlant({
        variables: { plantData: { ...plantToSave } },
      });
      setSavedPlantIds([...savedPlantIds, plantToSave.plantId]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }


  return ( 
    <>
      <Jumbotron fluid className="text-dark" style={{marginTop:"45px", backgroundColor: "#C2CAD0"}}>
        <Container>
          <h1 style={{textAlign: "center", fontFamily: 'Oleo Script, cursive', fontSize: "72px"}}>Our Beautiful Plant Page</h1>
        </Container>
      </Jumbotron>
        <Row xs={1} md={2} lg={4}>
          {data.plants.map((plants, i) => (
            <Col key={plants._id}>
              <Card  border="light" style={{width: "24rem", margin:"10px", padding: "0px 10px 0px 10px"}} id="cardSizing">
                {plants.plantImage ? (
                  <Card.Img style={{height:"36rem"}}
                  src={plants.plantImage}
                  alt={`The cover for ${plants.plantName}`}
                  variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title style={{fontFamily: 'Oleo Script, cursive', fontSize:"32px", textAlign:"center"}}>{plants.plantName}</Card.Title>
                  <p className="medium">Sun: {plants.plantLight}</p>
                  <p className="medium">Water: {plants.plantWater}</p>
                  <p className="medium">Pet-Friendly: {checkTrue(plants.petFriendly)}</p>
                  {/* <p className="medium">More Info: {plants.plantInfo}</p> */}
                  {Auth.loggedIn() && (
                    <Button
                    disabled={savedPlantIds?.some(
                      (savedId) => savedId === plant.plantId
                      )}
                      className="btn-block"
                      style={{backgroundColor: "#E7717D"}} 
                      onClick={() => {
                        jonSavePlant( { variables: {userID: user.data._id, plantName: plants.plantName,
                        plantLight: plants.plantLight, plantWater: plants.plantWater, petFriendly: plants.petFriendly,
                      plantImage: plants.plantImage, moreInfo: plants.moreInfo, lastWater: new Date(), nextWater: "",
                    waterFrequency: plants.waterFrequency} })
                      }}
                      >
                      {savedPlantIds?.some((savedId) => savedId === plant.plantId)
                        ? "It's ok he's already adopted"
                        : 'Adopt this plant🌱'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>
    </>
  );
};

export default SearchPlants;