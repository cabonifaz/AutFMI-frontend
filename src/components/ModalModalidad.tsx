import { FC, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { TalentoType } from '../types/TalentoType';

interface ModalModalidadProps {
  mostrar: boolean;
  manejarCerrar: () => void;
  talento: TalentoType;
}

const ModalModalidad: FC<ModalModalidadProps> = ({ mostrar, manejarCerrar, talento }) => {
  const navigate = useNavigate();
  const selectRef = useRef<HTMLSelectElement>(null);

  const onContinue = () => {
    const modalidad = selectRef.current?.value;
    if (modalidad) {
      navigate('/pantallaIngreso', { state: { talento, modalidad } });
    }
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
            <Form.Control
              as="select"
              ref={selectRef}>
              <option value="Planilla">Planilla</option>
              <option value="Locación de servicios">Locación de servicios</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={manejarCerrar}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalModalidad;
