import { FC } from 'react';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';

const PantallaMovimiento: FC = () => {
    const location = useLocation();
    const goBack = useGoBack();
    const { talento } = location.state || {};
    const modalidad = 'Planilla';

    return (
        <div className="container mt-4 mb-5">
            <h3 className="text-start">Modalidad: temp</h3>

            {/* Sección Datos del talentoorador */}
            <div className="p-3 border rounded mb-3">
                <h5 className="text-start ms-2">Datos del talento</h5>
                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Nombre y apellido</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" defaultValue={talento?.nombres + ' ' + talento?.apellidos} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="align-items-center mt-3">
                    <Col sm="4" className="text-start">
                        <Form.Label>Unidad</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control as="select" defaultValue={talento.unidad}>
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
                            <Form.Control as="select" defaultValue={talento.unidad}>
                                <option>Empresa 1</option>
                                <option>Empresa 2</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>
                )}
            </div>

            <div className="p-3 border rounded mb-3">
                <h5 className="text-start ms-2">Movimiento</h5>

                <Form.Group as={Row} className="align-items-center mt-3">
                    <Col sm="4" className="text-start">
                        <Form.Label>Cambio de estructura salarial</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Table bordered className="estructura-salarial mt-2">
                            <thead>
                                <tr>
                                    <th className="text-center">
                                        <Form.Check type="checkbox" label="Base" />
                                    </th>
                                    <th className="text-center">
                                        <Form.Check type="checkbox" label="Movilidad" />
                                    </th>
                                    <th className="text-center">
                                        <Form.Check type="checkbox" label="Bono trimestral" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <Form.Control type="text" placeholder="Monto" />
                                    </td>
                                    <td>
                                        <Form.Control type="text" placeholder="Monto" />
                                    </td>
                                    <td>
                                        <Form.Control type="text" placeholder="Monto" />
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center mt-2">
                    <Col sm="4" className="text-start">
                        <Form.Label>Cambio de puesto</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center mt-2">
                    <Col sm="4" className="text-start">
                        <Form.Label>Cambio de área</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center mt-2">
                    <Col sm="4" className="text-start">
                        <Form.Label>Cambio de jornada</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control type="text" />
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

export default PantallaMovimiento;
