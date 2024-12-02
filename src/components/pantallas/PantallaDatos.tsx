import { FC } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useGoBack } from '../../hooks/useGoBack';

const PantallaDatos: FC = () => {
    const location = useLocation();
    const goBack = useGoBack();
    const { colab } = location.state || {};

    return (
        <div className="container mt-4 mb-5">
            <h3 className="text-start">Datos Personales</h3>

            <div className="p-3 border rounded mb-3 d-flex flex-column gap-3">
                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Nombre y apellido</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Contacto</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={colab.unidad} />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>DNI</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Corre personal</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Tiempo de contrato</Form.Label>
                    </Col>
                    <Col sm="4">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                    <Col sm="4">
                        <div className="input-group">
                            <Form.Control
                                as="select">
                                <option value="month">Mes(es)</option>
                                <option value="year">Año(s)</option>
                            </Form.Control>
                        </div>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center mt-3">
                    <Col sm="4" className="text-start">
                        <Form.Label>Inicio de labores</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="date" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Cargo</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" md="4" className="text-start">
                        <Form.Label>Remuneración</Form.Label>
                    </Col>
                    <Col sm="4" md="4">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                    <Col sm="4" md="4">
                        <Form.Control as="select" defaultValue="soles">
                            <option value="soles">Soles</option>
                            <option value="dolares">Dólares</option>
                        </Form.Control>
                    </Col>
                </Form.Group>


                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Modalidad</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control
                            as="select">
                            <option value="mod">Modalidad 1</option>
                            <option value="mod1">Modalidad 2</option>
                        </Form.Control>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Ubicación</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                </Form.Group>
            </div>

            <div className="d-flex justify-content-center mt-4 mb-4">
                <Button variant="secondary" className="me-3" onClick={goBack}>
                    Cancelar
                </Button>
                <Button variant="primary">
                    Guardar
                </Button>
            </div>
        </div>
    );
};

export default PantallaDatos;
