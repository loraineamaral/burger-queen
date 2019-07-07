import React from 'react';
import firebase from "../firebaseConfig";
import { Table, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Nav from "../components/nav"
import withFirebaseAuth from 'react-with-firebase-auth';
import { Container, Row, Card } from 'react-bootstrap';

const firebaseAppAuth = firebase.auth();
const database = firebase.firestore();

class Kitchen extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.state = {
      order: [],
      name: '',
      date: ''
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      database.collection('users').doc(user.uid).get()
        .then((querySnapshot) => {
          const name = querySnapshot.data().name
          this.setState({
            name: name
          });
        });
    })
    database.collection("orders").orderBy('date').get()
      .then((querySnapshot) => {
        const orders = querySnapshot.docs.map(doc => doc.data());
        this.setState({
          order: orders
        })
      })
  }

  logout() {
    firebase.auth().signOut()
      .then(this.props.history.push(`/`))
  }

  render() {
    const orderCollection = this.state.order;
    console.log(orderCollection)
    return (
      <div className="p-0 m-0 div-height">
        <Nav
          logout={this.logout}
          data={this.state}
        />
        <Container>
          <p className="col-md-12 d-flex justify-content-center red-border text-large red-text">Pedidos</p>
          <Row className="d-flex flex-wrap flex-row-reverse flex-wrap justify-content-center mx-1">
            {orderCollection.map((orderItems, i, j) => {
              return (
                <Card className="mx-1 mt-2 card-width">
                  <Card.Header className="text-center grey-text-bold">

                    <p key={i}>Atendente: {orderItems.name}</p>
                    <p key={j}>Cliente: {orderItems.client}</p>

                  </Card.Header>
                  <Card.Body className="grey-text-bold text-small bg-white">
                    {orderItems.order.map((item, i, j, k) => {
                      return (
                        <Table size="sm">
                          <tbody>
                            <tr>
                              <td className="text-left col-md-8" key={i}>{item.nome}</td>
                              <td className="right col-md-2" key={j}>{item.quantity}</td>
                            </tr>
                          </tbody>
                        </Table>
                      )
                    })}
                  </Card.Body>
                  <Card.Footer className="bg-white d-flex flex-column border-0 justify-content-center">
                    {/* {orderCollection.map((item, i) => {
                        return(
                        
                        )
                      })} */}
                    <Button className="btn btn-success white-text justify-content-center  mt-auto p-1">Servir</Button>
                  </Card.Footer>
                </Card>
              )
            })
            }

          </Row>
        </Container>
      </div>
    );
  }
}

export default withFirebaseAuth({
  firebaseAppAuth,
})(Kitchen);
