import { FC } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useGoBack } from '../../hooks/useGoBack';

const PantallaCese: FC = () => {
    const location = useLocation();
    const goBack = useGoBack();
    const { colab } = location.state || {};
    const modalidad = 'Planilla';

    return (
        <div className="container mt-4 mb-5">
            <h3 className="text-start">Modalidad: temp</h3>

            {/* Sección Datos del Colaborador */}
            <div className="p-3 border rounded mb-3">
                <h5 className="text-start ms-2">Datos del colaborador</h5>
                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Nombre y apellido</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={colab.nombre} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="align-items-center mt-3">
                    <Col sm="4" className="text-start">
                        <Form.Label>Unidad</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control as="select" defaultValue={colab.unidad}>
                            <option>Unidad 1</option>
                            <option>Unidad 2</option>
                        </Form.Control>
                    </Col>
                </Form.Group>
                {modalidad !== 'Planilla' && (
                    <Form.Group as={Row} className="align-items-center mt-3">
                        <Col sm="4" className="text-start">
                            <Form.Label>Empresa</Form.Label>
                        </Col>
                        <Col sm="8">
                            <Form.Control as="select" defaultValue={colab.unidad}>
                                <option>Empresa 1</option>
                                <option>Empresa 2</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>
                )}
            </div>

            <div className="p-3 border rounded mb-3">
                <h5 className="text-start ms-2">Cese</h5>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Motivo de cese</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control as="select">
                            <option>Despido</option>
                            <option>Renuncia</option>
                            <option>Culminación de la obra o servicio</option>
                        </Form.Control>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center mt-3">
                    <Col sm="4" className="text-start">
                        <Form.Label>F. Movimiento</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="date" />
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

export default PantallaCese;
