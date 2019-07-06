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
      name: ''
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
    database.collection("orders").get()
      .then((querySnapshot) => {
        const orders = querySnapshot.docs.map(doc => doc.data());
        this.setState({ order: orders })
      })
  }


  logout() {
    firebase.auth().signOut()
      .then(this.props.history.push(`/`))
  }

  render() {
    const banana = this.state.order;
    return (
      <div className="p-0 m-0 div-height">
        <Nav
          logout={this.logout}
          data={this.state}
        />
        <Container>
            <p className="col-md-12 d-flex justify-content-center red-border text-large red-text">Pedidos</p>
          <Row className="d-flex flex-wrap mx-1">
            {banana.map((orderItems, i, j) => {
              return (
                <Card className="mx-1">
                  <Card.Header className="text-center grey-text-regular">
                    <p key={i}>Atendente: {orderItems.name}</p>
                    <p key={j}>Cliente: {orderItems.client}</p>
                  </Card.Header>
                  <Card.Body className="grey-text-regular text-small bg-white">
                    {orderItems.order.map((item, i, j) => {
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
                    <Card.Footer className="bg-white d-flex justify-content-center">
                    <Button className="btn btn-success white-text p-1">Servir</Button>
                    </Card.Footer>
                  </Card.Body>
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

