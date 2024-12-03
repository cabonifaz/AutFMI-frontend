import { FC, useEffect, useRef } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useGoBack } from '../../hooks/useGoBack';
import { TalentoType } from '../../types/TalentoType';
import useTalento from '../../hooks/useTalento';
import Loading from '../loading/Loading';

const PantallaDatos: FC = () => {
    const location = useLocation();
    const goBack = useGoBack();
    const { talento } = location.state as { talento: TalentoType } || {};
    const { talentoDetails, loading } = useTalento(talento.idTalento);

    const formRefs = useRef({
        nombres: null as HTMLInputElement | null,
        telefono: null as HTMLInputElement | null,
        dni: null as HTMLInputElement | null,
        email: null as HTMLInputElement | null,
        numTiempoContrato: null as HTMLInputElement | null,
        cargo: null as HTMLInputElement | null,
        remuneracion: null as HTMLInputElement | null,
        ubicacion: null as HTMLInputElement | null,
        tiempoContratoSelect: null as HTMLSelectElement | null,
        monedaSelect: null as HTMLSelectElement | null,
        modalidadSelect: null as HTMLSelectElement | null,
    });

    useEffect(() => {
        if (talentoDetails) {
            const {
                nombres,
                apellidos,
                telefono,
                dni,
                email,
                numTiempoContrato,
                cargo,
                remuneracion,
                ubicacion,
                idTiempoContrato,
                idMoneda,
                idModalidad
            } = talentoDetails;

            formRefs.current.nombres!.value = `${nombres} ${apellidos}`;
            formRefs.current.telefono!.value = telefono;
            formRefs.current.dni!.value = dni;
            formRefs.current.email!.value = email;
            formRefs.current.numTiempoContrato!.value = numTiempoContrato.toString();
            formRefs.current.cargo!.value = cargo;
            formRefs.current.remuneracion!.value = remuneracion;
            formRefs.current.ubicacion!.value = ubicacion;

            formRefs.current.tiempoContratoSelect!.value = idTiempoContrato.toString();
            formRefs.current.monedaSelect!.value = idMoneda.toString();
            formRefs.current.modalidadSelect!.value = idModalidad.toString();
        }
    }, [talentoDetails]);

    const handleSave = () => {
        const formData = {
            nombres: formRefs.current.nombres!.value,
            telefono: formRefs.current.telefono!.value,
            dni: formRefs.current.dni!.value,
            email: formRefs.current.email!.value,
            numTiempoContrato: formRefs.current.numTiempoContrato!.value,
            cargo: formRefs.current.cargo!.value,
            remuneracion: formRefs.current.remuneracion!.value,
            ubicacion: formRefs.current.ubicacion!.value,
            idTiempoContrato: formRefs.current.tiempoContratoSelect!.value,
            idMoneda: formRefs.current.monedaSelect!.value,
            idModalidad: formRefs.current.modalidadSelect!.value
        };

        console.log('Saved:', formData);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="container mt-4 mb-5">
            <h3 className="text-start">Datos Personales</h3>

            <div className="p-3 border rounded mb-3 d-flex flex-column gap-3">
                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Nombre y apellido</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.nombres = el}
                            type="text"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Contacto</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.telefono = el}
                            type="text"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>DNI</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.dni = el}
                            type="text"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Correo personal</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.email = el}
                            type="text"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Tiempo de contrato</Form.Label>
                    </Col>
                    <Col sm="4">
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.numTiempoContrato = el}
                            type="text"
                        />
                    </Col>
                    <Col sm="4">
                        <div className="input-group">
                            <Form.Select
                                ref={(el: HTMLSelectElement | null) => formRefs.current.tiempoContratoSelect = el}
                            >
                                <option value={1}>Mes(es)</option>
                                <option value={2}>Año(s)</option>
                            </Form.Select>
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
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.cargo = el}
                            type="text"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" md="4" className="text-start">
                        <Form.Label>Remuneración</Form.Label>
                    </Col>
                    <Col sm="4" md="4">
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.remuneracion = el}
                            type="text"
                        />
                    </Col>
                    <Col sm="4" md="4">
                        <Form.Select
                            ref={(el: HTMLSelectElement | null) => formRefs.current.monedaSelect = el}
                        >
                            <option value={1}>Soles</option>
                            <option value={2}>Dólares</option>
                        </Form.Select>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Modalidad</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Select
                            ref={(el: HTMLSelectElement | null) => formRefs.current.modalidadSelect = el}
                        >
                            <option value={1}>Locación de Servicios</option>
                            <option value={2}>Planilla - Reg. General</option>
                            <option value={3}>Planilla - Tiempo Parcial</option>
                            <option value={4}>Prácticas Pre profesionales</option>
                            <option value={5}>Prácticas Profesionales</option>
                        </Form.Select>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="align-items-center">
                    <Col sm="4" className="text-start">
                        <Form.Label>Ubicación</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Form.Control
                            ref={(el: HTMLInputElement | null) => formRefs.current.ubicacion = el}
                            type="text"
                        />
                    </Col>
                </Form.Group>
            </div>

            <div className="d-flex justify-content-center mt-4 mb-4">
                <Button variant="secondary" className="me-3" onClick={goBack}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Guardar
                </Button>
            </div>
        </div>
    );
};

export default PantallaDatos;
