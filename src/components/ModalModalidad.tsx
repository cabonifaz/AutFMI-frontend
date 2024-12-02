import { FC, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { ColaboradorType } from '../types/ColaboradorType';
import { useNavigate } from 'react-router-dom';

interface ModalIngresoProps {
  mostrar: boolean;
  manejarCerrar: () => void;
  colab: ColaboradorType;
  action: string;
}

const ModalModalidad: FC<ModalIngresoProps> = ({ mostrar, manejarCerrar, colab, action }) => {
  const navigate = useNavigate();
  const selectRef = useRef<HTMLSelectElement>(null);

  const onContinue = () => {
    const modalidad = selectRef.current?.value;
    if (modalidad) {
      switch (action) {
        case 'ingreso': {
          navigate('/pantallaIngreso', { state: { colab, modalidad } });
          break;
        }
        case 'movimiento': {
          navigate('/pantallaMovimiento', { state: { colab, modalidad } });
          break;
        }
        case 'cese': {
          navigate('/pantallaCese', { state: { colab, modalidad } });
          break;
        }
      }

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
