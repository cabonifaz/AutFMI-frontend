import React from 'react';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';

interface PantallaIngresoProps {
  colaborador: any;
  onCancelar: () => void;
}

const PantallaIngreso: React.FC<PantallaIngresoProps> = ({ colaborador, onCancelar }) => {
  return (
    <div className="container mt-4 mb-5">
      <h3 className="text-start">Modalidad: Planilla</h3>

      {/* Sección Datos del Colaborador */}
      <div className="p-3 border rounded mb-3">
        <h5 className="text-start ms-2">Datos del colaborador</h5>
        <Form.Group as={Row} className="align-items-center">
          <Col sm="4" className="text-start">
            <Form.Label>Nombre y apellido</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control type="text" defaultValue={colaborador.nombre} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="align-items-center mt-3">
          <Col sm="4" className="text-start">
            <Form.Label>Unidad</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control as="select" defaultValue={colaborador.unidad}>
              <option>Unidad 1</option>
              <option>Unidad 2</option>
            </Form.Control>
          </Col>
        </Form.Group>
      </div>

      {/* Sección Ingreso */}
      <div className="p-3 border rounded mb-3">
        <h5 className="text-start ms-2">Ingreso</h5>
        <Form.Group as={Row} className="align-items-center">
          <Col sm="4" className="text-start">
            <Form.Label>Motivo de ingreso</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control as="select">
              <option>Aumento de la producción o servicio</option>
              <option>Cubrir vacante</option>
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="align-items-center mt-3">
          <Col sm="4" className="text-start">
            <Form.Label>Cargo</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control type="text" placeholder="Escriba el cargo" />
          </Col>
        </Form.Group>

        {/* Tabla de Estructura Salarial */}
        <Form.Group as={Row} className="align-items-center mt-3">
          <Col sm="4" className="text-start">
            <Form.Label>Estructura salarial</Form.Label>
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

        <Form.Group as={Row} className="align-items-center mt-3">
          <Col sm="4" className="text-start">
            <Form.Label>F. Inicio contrato</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control type="date" />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="align-items-center mt-3">
          <Col sm="4" className="text-start">
            <Form.Label>F. Termino contrato</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control type="date" />
          </Col>
        </Form.Group>
      </div>

      {/* Sección Proyecto/Servicio */}
      <div className="p-3 border rounded mb-3">
        <h5 className="text-start ms-2">Proyecto/Servicio</h5>
        <Form.Group as={Row} className="align-items-center mt-2">
          <Col sm="4" className="text-start">
            <Form.Label>Proyecto/Servicio</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control type="text" placeholder="Escribir el nombre de proyecto o servicio" />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="align-items-center mt-3">
          <Col sm="4" className="text-start">
            <Form.Label>Objeto del contrato</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control type="text" placeholder="Escribir el objeto del contrato" />
          </Col>
        </Form.Group>
      </div>

      {/* Sección Declaración en SUNAT */}
      <div className="p-3 border rounded mb-3">
        <h5 className="text-start ms-2">Declaración en SUNAT (*)</h5>
        <Form.Group as={Row} className="align-items-center mt-2">
          <Col sm="4" className="text-start">
            <Form.Label>¿Declarado en SUNAT?</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control as="select">
              <option>Elija un elemento</option>
              <option>Sí</option>
              <option>No</option>
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="align-items-center mt-3">
          <Col sm="4" className="text-start">
            <Form.Label>Sede a declarar</Form.Label>
          </Col>
          <Col sm="8">
            <Form.Control as="select">
              <option>Elija una sede</option>
              <option>Sede 1</option>
              <option>Sede 2</option>
            </Form.Control>
          </Col>
        </Form.Group>
      </div>

      {/* Botones de Cancelar y Generar PDF */}
      <div className="d-flex justify-content-center mt-4 mb-4">
        <Button variant="secondary" onClick={onCancelar} className="me-3">
          Cancelar
        </Button>
        <Button variant="primary">
          Generar PDF
        </Button>
      </div>
    </div>
  );
};

export default PantallaIngreso;
