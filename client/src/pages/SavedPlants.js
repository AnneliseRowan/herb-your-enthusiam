import React from 'react';
import {
  Jumbotron,
  Container,
  CardGroup,
  Card,
  Button,
  Row,
  Col,
  Collapse
} from 'react-bootstrap';
import {Helmet} from 'react-helmet';

import { useQuery, useMutation } from '@apollo/client';
import { QUERY_ME, QUERY_USER_PLANT } from '../utils/queries';
import { REMOVE_PLANT, UPDATE_PLANT } from '../utils/mutations';
import { removePlantId } from '../utils/localStorage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Style.css'

import Auth from '../utils/auth';

const SavedPlants = () => {
  const { loading, data } = useQuery(QUERY_USER_PLANT);

  console.log(data, 'raawwwrs')

  const [removePlant, { error }] = useMutation(REMOVE_PLANT);

  const [waterPlant, { error2 }] = useMutation(UPDATE_PLANT)

  const userData = data?.userplants || {};


  const checkTrue = (thing) => {
    if (thing) {
      return `Yes`
    } else
      return `No`
  }
  const user = Auth.getProfile()

  // const [expandedId, setExpandedId] = React.useState(false, -1);
  const handleWaterPlant = async (plantId2, waterFrequency) => {
    const waterSuccess = () => {
      toast("Hooray! Your plant is watered")
    };
    waterSuccess();
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }
    const water1 = new Date();
    const water2 = new Date();

    water2.setDate(water1.getDate()+ waterFrequency)

    try {
      const { data2 } = await waterPlant({
        variables: { _id: plantId2, lastWater: water1.toDateString(), nextWater: water2.toDateString() },
        refetchQueries: [
          { query: QUERY_USER_PLANT }
        ]
      })
    }
    catch (err) {
      console.error(err);
    }
  }
    ;


  const handleDeletePlant = async (plantId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removePlant({
        variables: { _id: plantId },
        refetchQueries: [
          { query: QUERY_USER_PLANT }
        ]
      });

      // upon success, remove plants's id from localStorage
      removePlantId(plantId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // const handleExpandClick = (e, i) => {
  //   e.stopPropagation()
  //   setExpandedId(expandedId === i ? -1 : i);
  // };

  return (
    <>
      <Helmet>
        <style>{'body { background:repeating-linear-gradient(rgba(250,400,150,200),transparent);}'}</style>
      </Helmet>
      <div>
        <ToastContainer/>
        <div style={{
          backgroundColor: "#C2CAD0",
          display: "flex",
          paddingBottom: "20px",
          marginTop: "45px"
        }}>
          <div style={{ marginLeft: "15%", paddingTop: "30px", paddingBottom: "5px" }}>
            <img style={{ width: "190px", height: "190px", borderRadius: "80px" }}
              src="https://images.unsplash.com/photo-1523983254932-c7e6571c9d60?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2019&q=80"
            />
            <span style={{ fontFamily: 'Oleo Script, cursive', fontSize: "96px", marginLeft: "20px" }}>{user.data.username}'s Plant Family</span>
          </div>
        </div>
      </div>
      <Container>
        <h2 style={{ textAlign: "center", marginTop: "45px" }}>
          {userData.length
            ? `See Your Garden, Make It Grow...` :
            'Uh-Oh, Hurry! Adopt some plants!'}
        </h2>

      </Container>
      <Row xs={1} md={2} lg={4} >
        {data.userplants?.map((plant) => (
          <Col key={plant._id}>
            <Card border="light" style={{ width: "24rem", margin: "10px", padding: "0px 10px 0px 10px" }} id="cardSizing">
              {plant.plantImage ? (
                <Card.Img style={{ height: "36rem" }}
                  src={plant.plantImage}
                  alt={`The image for ${plant.plantName}`}
                  variant="top"
                />
              ) : null}
              <Card.Body>
                <Card.Title style={{ fontFamily: 'Oleo Script, cursive', fontSize: "32px", textAlign: "center" }}>{plant.plantName}</Card.Title>
                <p className="medium"><b>Sun</b>: {plant.plantLight}</p>
                <p className="medium"><b>Water</b>: {plant.plantWater}</p>
                <p className="medium"><b>Last Watered</b>: {plant.lastWater}</p>
                <p className="medium"><b>Next Watered</b>: {plant.nextWater}</p>

                <p className="medium">Pet-Friendly: {checkTrue(plant.petFriendly)}</p>
                <Button
                  onClick={() => handleWaterPlant(plant._id, parseInt(plant.waterFrequency))}>
                  Water Me!
                </Button>
                <Button
                  className="btn-block"
                  style={{ backgroundColor: "#88BDBC" }}
                  onClick={() => handleDeletePlant(plant._id)}
                >
                  Adios Plant!
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default SavedPlants;
