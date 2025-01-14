import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import {
  Jumbotron,
  Container,
  Col,
  Form,
  Button,
  Card,
  CardColumns,
  Row,
  Collapse
} from 'react-bootstrap';
import {Helmet} from 'react-helmet';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { gql, useQuery, useMutation } from '@apollo/client';
//import { useMutation } from '@apollo/client';
import { SAVE_PLANT, JON_PLANT } from '../utils/mutations';
import { QUERY_PLANT, QUERY_USER_PLANT } from '../utils/queries';
import { savePlantIds, getSavedPlantIds } from '../utils/localStorage';
import Auth from '../utils/auth';
import './Style.css'
import plant from './plantData'; 

const SearchPlants = () => {
  const user = Auth.getProfile()
  const { loading, data } = useQuery(QUERY_PLANT); 

  const userData = data?.plants || [];
    
  const [searchedPlants, setSearchedPlants] = useState([]);

  const [savedPlantIds, setSavedPlantIds] = useState(getSavedPlantIds());

  const [savePlant, { error }] = useMutation(SAVE_PLANT);

  const [expandedId, setExpandedId] = React.useState(false, -1);

  const plantObject = {}

  const doubleOnClick = (e, plants) => {
    e.stopPropagation();
    const addSuccess = () => {
      toast.success(`You added ${plants.plants.variables.plantName} to your garden!!!!`)
    };
    addSuccess();
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    jonSavePlant( { variables: {userID: user.data._id, plantName: plants.plants.variables.plantName,
      plantLight: plants.plants.variables.plantLight, plantWater: plants.plants.variables.plantWater, petFriendly: plants.plants.variables.petFriendly,
      plantImage: plants.plants.variables.plantImage, moreInfo: plants.plants.variables.moreInfo, lastWater: "", nextWater: "",
      waterFrequency: plants.plants.variables.waterFrequency},
      refetchQueries: [{ query: QUERY_USER_PLANT,
        variables:  {userID: user.data._id}
      }
    ]
    })
  }

  useEffect(() => {
    return () => savePlantIds(savedPlantIds);
  });

  const checkTrue = (thing) => {
    if(thing) {
      return `Yes`
    } else
    return `No`
  }

  const handleExpandClick = (e, i) => {
    e.stopPropagation()
    setExpandedId(expandedId === i ? -1 : i);
  };

  const [jonSavePlant, { data: savePlantData }] = useMutation(JON_PLANT)

  // create function to handle saving a plant to our user
  const handleSavePlant = async (plantId) => {
    // find the plant in `searchedPlants` state by the matching id
    const plantToSave = searchedPlants.find((plant) => plant.plantId === plantId);

    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return (false);
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
  const waterSuccess = () => {
    toast("Hooray! Your plant is watered")
  };


  return ( 
    <>
    <ToastContainer/>

      <Helmet>
        <style>{'body { background:repeating-linear-gradient(rgba(250,400,150,200),transparent);}'}</style>
      </Helmet>
      <Jumbotron fluid className="text-dark bg-light" style={{marginTop:"45px", border:'solid', "backgroundImage": "url('https://images.unsplash.com/photo-1496309732348-3627f3f040ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"}}>

        <Container>
          <h1 style={{textAlign: "center", fontFamily: 'Oleo Script, cursive', color: 'green', fontSize: "72px"}}>Meet the Plants</h1>
          {/* <p style={{textAlign: "center", fontFamily: 'Oleo Script, cursive', fontSize: "18px"}}>more to come...</p> */}
        </Container>
      </Jumbotron>
        <Row xs={1} md={2} lg={4}>
          {data.plants.map((plants, i) => (
            <Col>
              <Card class="card" key={plants._id} className="bg-warning" style={{width: "20rem", margin:"10px"}} id="cardSizing">
                {plants.plantImage ? (
                  <Card.Img style={{height:"20rem"}} 
                    className="border-bottom border-dark"
                    src={plants.plantImage}
                    alt={`The cover for ${plants.plantName}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body
                  onClick={e => handleExpandClick(e, i)}
                    aria-controls="plantInfo"
                    aria-expanded={expandedId === i}>
                  <div id="HiddenTextTitle">
                    <p id="HiddenText" align="center">Click for More Info</p>
                  </div>
                  <Card.Title style={{fontFamily: 'Oleo Script, cursive', fontSize:"22px", textAlign:"center"}}>{plants.plantName}</Card.Title>
                  <Collapse in={expandedId === i}>
                    <div id="plantInfo">
                      <p className="medium"><b>Sun:</b> {plants.plantLight}</p>
                      <p className="medium"><b>Water:</b> {plants.plantWater}</p>
                      <p className="medium"><b>Pet-Friendly:</b> {checkTrue(plants.petFriendly)}</p>
                    </div>
                  </Collapse>
                  {/* <Card.Text>{plants.plantLight}</Card.Text> */}
                  {Auth.loggedIn() && (
                    <Row>
                      <div class='text-center'>
                        <Button size="sm"
                        disabled={savedPlantIds?.some(
                          (savedId) => savedId === plant.plantId
                          )}
                          className="btn-block btn-light" 

                          onClick={ e => doubleOnClick( e, {plants: { variables: {userID: user.data._id, plantName: plants.plantName,
                            plantLight: plants.plantLight, plantWater: plants.plantWater, petFriendly: plants.petFriendly,
                            plantImage: plants.plantImage, moreInfo: plants.moreInfo, lastWater: "", nextWater: "",
                            waterFrequency: plants.waterFrequency}}}) 
                          }
                          >
                          {savedPlantIds?.some((savedId) => savedId === plant.plantId)
                            ? "It's ok he's already adopted"
                            : 'Adopt🌱'}
                        </Button>
                      </div>
                    </Row>

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
