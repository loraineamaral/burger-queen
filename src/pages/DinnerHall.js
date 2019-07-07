import React from 'react';
import firebase from "../firebaseConfig";
import { Col, Row, Container, Card, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Nav from "../components/nav"
import Menu from "../components/menu"
import withFirebaseAuth from 'react-with-firebase-auth';

const firebaseAppAuth = firebase.auth();
const database = firebase.firestore();

class Hall extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.state = {
      order: [],
      client: '',
      name: '',
      now: ''
    };
    this.interval = null;
  }

  handleChange = (event, element) => {
    event.preventDefault();
    const newState = this.state;
    newState[element] = event.target.value
    this.setState(newState);
  }

  logout() {
    firebase.auth().signOut()
      .then(this.props.history.push(`/`))
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      database.collection('users').doc(user.uid).get()
        .then((querySnapshot) => {
          const name = querySnapshot.data().name
          this.setState({
            name: name,
            now: new Date()
          });
        });
      const self = this;
      self.interval = setInterval(function () {
        self.setState({
          now: new Date(),
        });
      }, 1000);
    })
  }

  addItem = (item) => {
    const itemIndex = this.state.order.findIndex((product) => {
      return product.nome === item.nome;
    });

    if (itemIndex < 0) {
      const newItem = {
        ...item,
        quantity: 1
      };

      this.setState({
        order: this.state.order.concat(newItem)
      });
    } else {
      let newOrder = this.state.order;
      newOrder[itemIndex].quantity += 1;
      this.setState({
        order: newOrder
      });
    }
  }

  delItem = (item) => {
    const itemIndex = this.state.order.findIndex((product) => {
      return product.nome === item.nome;
    });

    let newOrder = this.state.order;
    newOrder[itemIndex].quantity -= 1;

    const quantity = newOrder[itemIndex].quantity;

    if (quantity > 0) {
      this.setState({
        order: newOrder
      });
    } else {
      newOrder.splice(itemIndex, 1);
      this.setState({
        order: newOrder
      });
    }
  }

  sendOrder = (event) => {
    event.preventDefault();
    if (this.state.client === "") {
      alert("Insira o nome do cliente")
    } else {
      database.collection("orders").add({
        name: this.state.name,
        client: this.state.client,
        order: this.state.order,
        date: this.state.now
      })
        .then(() => {
          this.setState({ client: "", order: [], date: "" })
        })
    }
  }


  render() {
    const orderTotal = this.state.order.reduce((acc, cur) => {
      return acc + (cur.quantity * cur.preco)
    }, 0);
    return (
      <div className="p-0 m-0 div-height">
        <Nav
          logout={this.logout}
          data={this.state}
        />

        <Container className="">
          <Row>

            <Col className="mr-1 p-0 ">
              <Menu
                addItem={this.addItem}
                delItem={this.delItem}
              />
            </Col>

            <Col className="ml-1 p-0">
              <Card className="">
                <Card.Body>
                  <p className="red-text text-large font-weight-bold ml-2 mt-1">Pedido</p>

                  <input onChange={(event) => this.handleChange(event, "client")} value={this.state.client} className="input-border grey-text ml-2 mb-5" type="text" placeholder="Nome do Cliente" />

                  {this.state.order.map((product, i, j, k) => {
                    return (

                      <Table size="sm">

                        <tbody>
                          <tr className="grey-text text-small">
                            <td className="text-left col-md-8" key={i}>{product.nome} </td>
                            <td className="text-cente col-md-2" key={j}>{product.quantity}</td>
                            <td className="text-right col-md-2" key={k}>{product.preco * product.quantity},00</td>
                          </tr>
                        </tbody>
                      </Table>
                    )

                  })
                  }
                  <div className="d-flex flex-column">
                    <p className="grey-text text-large font-weight-bold ml-2 mt-4 ml-auto">Total: R$ {orderTotal},00</p>
                    <button className="btn-success rounded white-text text-large p-1" onClick={this.sendOrder}>Enviar Pedido</button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

          </Row>
        </Container>

      </div>
    );
  }
}

export default withFirebaseAuth({
  firebaseAppAuth,
})(Hall);
