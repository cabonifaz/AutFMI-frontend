import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface ModalIngresoProps {
  mostrar: boolean;
  manejarCerrar: () => void;
}

const ModalIngreso: React.FC<ModalIngresoProps> = ({ mostrar, manejarCerrar }) => {
  const manejarGuardar = () => {
    manejarCerrar();
  };

  return (
    <Modal show={mostrar} onHide={manejarCerrar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modalidad</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formModalidadIngreso">
            <Form.Label>Seleccione modalidad de ingreso</Form.Label>
            <Form.Control as="select">
              <option>Planilla</option>
              <option>Locación de servicios</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={manejarCerrar}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={manejarGuardar}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalIngreso;
