'use client'

import React, { ReactElement, useEffect, useState } from "react";
import Layout from '@/layouts/dashboard/index2';
import BreadcrumbItem from '@/common/BreadcrumbItem';
import { useRetrieveUserQuery } from '@/redux/features/authApiSlice';
import { ProgressBar, TabContainer, Col, Form, Card, Nav, Row, Tab } from "react-bootstrap";
import './form.css';
import ava2 from "@/public/assets/images/user/avatar-2.jpg";
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Select from 'react-select';  // Importar react-select

const Page = () => {
    const { data: user, isError, isLoading } = useRetrieveUserQuery();
    const [key, setKey] = useState('tab-1');
    const [progress, setProgress] = useState(25);
    const totalTabs = 4;

    const { push } = useRouter();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        profession: '',
        hasExperience: '',
        experience: '',
        street: '',
        city: '',
        availableDays: [],
        availableTimes: [],
        modality: '',
        topics: [],
        goals: '',
        motivations: ''
    });

    useEffect(() => {
        const calculateProgress = () => {
            return ((parseInt(key.split('-')[1]) - 1) / (totalTabs - 1)) * 100;
        };
        setProgress(calculateProgress());
    }, [key, totalTabs]);

    const handleTabSelect = (k) => {
        setKey(k);
    };

    const handleNext = () => {
        const nextKey = parseInt(key.split('-')[1]) + 1;
        setKey(`tab-${nextKey}`);
    };

    const handlePrevious = () => {
        const previousKey = parseInt(key.split('-')[1]) - 1;
        setKey(`tab-${previousKey}`);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked ? [...prevState[name], value] : prevState[name].filter(day => day !== value)
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleTopicsChange = (selectedOptions) => {
        // Actualiza el estado con los valores seleccionados (array de temas)
        setFormData({
            ...formData,
            topics: selectedOptions ? selectedOptions.map(option => option.value) : []  // Mapear para obtener solo los valores (temas seleccionados)
        });
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "La fecha de nacimiento es obligatoria";
        if (!formData.profession) newErrors.profession = "La profesión es obligatoria";
        if (!formData.street) newErrors.street = "La calle es obligatoria";
        if (!formData.city) newErrors.city = "La ciudad es obligatoria";
        if (formData.availableDays.length === 0) newErrors.availableDays = "Se requiere al menos un día disponible";
        if (formData.availableTimes.length === 0) newErrors.availableTimes = "Se requiere al menos un horario disponible";
        if (!formData.modality) newErrors.modality = "La modalidad es obligatoria";
        if (!formData.topics) newErrors.topics = "Los temas son obligatorios";
        if (!formData.goals) newErrors.goals = "Los objetivos son obligatorios";
        if (!formData.motivations) newErrors.motivations = "Las motivaciones son obligatorias";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstError = Object.values(newErrors)[0];
            toast.error(firstError);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8000/api/user/form/${user.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Error al guardar los datos del formulario');
            }

            const data = await response.json();
            toast.success(data.message || '¡Datos del formulario guardados con éxito!');
            window.location.href = '/dashboard';

        } catch (error) {
            console.error('Error al guardar los datos del formulario', error);
            toast.error('Error al guardar los datos del formulario');
        }
    };

    if (isLoading) return <p>Cargando...</p>;
    if (isError || !user) return <p>¡Error al cargar los datos del usuario!</p>;

    return (
        <Layout>
            <Row>
                <Col sm={12}>
                    <div id="basicwizard" className="form-wizard row justify-content-center">
                        <div className="col-sm-12 col-md-6 col-xxl-4 text-center">
                            <h3>Construye tu perfil</h3>
                            <p className="text-muted mb-4">Necesitas completar tu perfil para continuar.</p>
                        </div>
                        <Col xs={12}>
                            <TabContainer defaultActiveKey="tab-1" activeKey={key} onSelect={handleTabSelect}>
                                <Card>
                                    <Card.Body className="p-3">
                                        <Nav className="nav-pills nav-justified">
                                            <Nav.Item as="li" className="nav-item" data-target-form="#contactDetailForm">
                                                <Nav.Link eventKey="tab-1" href="#contactDetail" data-bs-toggle="tab" data-toggle="tab">
                                                    <i className="ph-duotone ph-user-circle"></i>
                                                    <span className="d-none d-sm-inline">Sobre mí</span>
                                                </Nav.Link>
                                            </Nav.Item>

                                            <Nav.Item data-target-form="#jobDetailForm">
                                                <Nav.Link eventKey="tab-2" href="#jobDetail" data-bs-toggle="tab" data-toggle="tab" className="nav-link icon-btn">
                                                    <i className="ph-duotone ph-map-pin"></i>
                                                    <span className="d-none d-sm-inline">Ubicación y Disponibilidad</span>
                                                </Nav.Link>
                                            </Nav.Item>

                                            <Nav.Item className="nav-item" data-target-form="#educationDetailForm">
                                                <Nav.Link eventKey="tab-3" href="#educationDetail" data-bs-toggle="tab" data-toggle="tab" className="nav-link icon-btn">
                                                    <i className="ph-duotone ph-user"></i>
                                                    <span className="d-none d-sm-inline">Preferencias del Usuario</span>
                                                </Nav.Link>
                                            </Nav.Item>

                                            <Nav.Item>
                                                <Nav.Link eventKey="tab-4" href="#finish" data-bs-toggle="tab" data-toggle="tab" className="nav-link icon-btn">
                                                    <i className="ph-duotone ph-check-circle"></i>
                                                    <span className="d-none d-sm-inline">Objetivos y Motivaciones</span>
                                                </Nav.Link>
                                            </Nav.Item>

                                        </Nav>
                                    </Card.Body>
                                </Card>
                                <Card>
                                    <div className="card-body">
                                        <Tab.Content>
                                            <ProgressBar now={progress} className="mb-3" style={{ height: '7px' }} />

                                            <Tab.Pane eventKey="tab-1" className="tab-pane" id="contactDetail">
                                                <div className="text-center">
                                                    <h3 className="mb-2">¿Quién eres?</h3>
                                                    <small className="text-muted">Cuéntanos más sobre tus habilidades y experiencia</small>
                                                </div>
                                                <div className="row mt-4">
                                                    <div className="col">
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <Form.Label htmlFor="example-datemax">Fecha de Nacimiento</Form.Label>
                                                                    <Form.Control type="date" id="example-datemax" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="form-label">Ocupación</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control capitalize-input"
                                                                        name="profession"
                                                                        placeholder="¿En qué campo?"
                                                                        value={formData.profession}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="form-label">¿Has tenido experiencia siendo parte de una organización?</label>
                                                                    <select
                                                                        className="form-select height-checkbox"
                                                                        name="hasExperience"
                                                                        value={formData.hasExperience}
                                                                        onChange={handleChange}
                                                                    >
                                                                        <option value="">Selecciona una opción</option>
                                                                        <option value="yes">Sí</option>
                                                                        <option value="no">No</option>
                                                                    </select>                                                                    
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="form-label">Cuéntanos sobre tu experiencia</label>
                                                                    <textarea
                                                                        className="form-control"
                                                                        name="experience"
                                                                        placeholder="Describe cualquier experiencia o habilidades relevantes."
                                                                        value={formData.experience}
                                                                        onChange={handleChange}
                                                                        disabled={formData.hasExperience === 'no'} // Deshabilitar si no tiene experiencia
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="tab-2" className="tab-pane" id="jobDetail">
                                                <div className="text-center">
                                                    <h3 className="mb-2">Ubicación y Disponibilidad</h3>
                                                    <small className="text-muted">Proporciona tu ubicación y cuándo estás disponible para realizar actividades.</small>
                                                </div>
                                                <div className="row mt-4">
                                                    <div className="col-sm-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Ciudad</label>
                                                            <input
                                                                type="text"
                                                                className="form-control capitalize-input"
                                                                name="city"
                                                                placeholder="Introduce la ciudad"
                                                                value={formData.city}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Calle</label>
                                                            <input
                                                                type="text"
                                                                className="form-control capitalize-input"
                                                                name="street"
                                                                placeholder="Introduce la calle"
                                                                value={formData.street}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <div className="form-group row">
                                                            <label className="form-label">Días disponibles</label>
                                                            <Col sm={13}>
                                                                <div className="label-checkbox">
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        label="Lun"
                                                                        className="small-checkbox"
                                                                        name="availableDays"
                                                                        value="Lun"
                                                                        checked={formData.availableDays.includes("Lun")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        id="customCheckinlh2"
                                                                        label="Mar"
                                                                        className="small-checkbox"
                                                                        name="availableDays"
                                                                        value="Mar"
                                                                        checked={formData.availableDays.includes("Mar")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        id="customCheckinlh3"
                                                                        label="Mié"
                                                                        className="small-checkbox"
                                                                        name="availableDays"
                                                                        value="Mié"
                                                                        checked={formData.availableDays.includes("Mié")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        id="customCheckinlh3"
                                                                        label="Jue"
                                                                        className="small-checkbox"
                                                                        name="availableDays"
                                                                        value="Jue"
                                                                        checked={formData.availableDays.includes("Jue")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        id="customCheckinlh3"
                                                                        label="Vie"
                                                                        className="small-checkbox"
                                                                        name="availableDays"
                                                                        value="Vie"
                                                                        checked={formData.availableDays.includes("Vie")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        id="customCheckinlh3"
                                                                        label="Sáb"
                                                                        className="small-checkbox"
                                                                        name="availableDays"
                                                                        value="Sáb"
                                                                        checked={formData.availableDays.includes("Sáb")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        id="customCheckinlh3"
                                                                        label="Dom"
                                                                        className="small-checkbox"
                                                                        name="availableDays"
                                                                        value="Dom"
                                                                        checked={formData.availableDays.includes("Dom")}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </Col>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <div className="form-group row">
                                                            <label className="form-label">Horarios del día</label>
                                                            <Col sm={10}>
                                                                <div className="label-checkbox">
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        label="Mañana"
                                                                        className="small-checkbox"
                                                                        name="availableTimes"
                                                                        value="Mañana"
                                                                        checked={formData.availableTimes.includes("Mañana")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"
                                                                        id="customCheckinlh2"
                                                                        label="Tarde"
                                                                        className="small-checkbox"
                                                                        name="availableTimes"
                                                                        value="Tarde"
                                                                        checked={formData.availableTimes.includes("Tarde")}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="checkbox"

                                                                        id="customCheckinlh3"
                                                                        label="Noche"
                                                                        className="small-checkbox"
                                                                        name="availableTimes"
                                                                        value="Noche"
                                                                        checked={formData.availableTimes.includes("Noche")}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </Col>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="tab-3" className="tab-pane" id="educationDetail">
                                                <div className="text-center">
                                                    <h3 className="mb-2">Preferencias del Usuario</h3>
                                                    <small className="text-muted">Cuéntanos sobre tus objetivos y motivaciones para estar en una organizacion.</small>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <div className="form-group row">
                                                            <label className="form-label">Preferencia de Modalidad</label>
                                                            <Col sm={13}>
                                                                <div className="label-checkbox">
                                                                    <Form.Check
                                                                        inline
                                                                        type="radio"
                                                                        name="modality"
                                                                        label="Presencial"
                                                                        className="small-checkbox"
                                                                        value="Presencial"
                                                                        checked={formData.modality === "Presencial"}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="radio"
                                                                        name="modality"
                                                                        id="customCheckinlh2"
                                                                        label="Virtual"
                                                                        className="small-checkbox"
                                                                        value="Virtual"
                                                                        checked={formData.modality === "Virtual"}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <Form.Check
                                                                        inline
                                                                        type="radio"
                                                                        name="modality"
                                                                        id="customCheckinlh3"
                                                                        label="Ambos tipos"
                                                                        className="small-checkbox"
                                                                        value="Ambos tipos"
                                                                        checked={formData.modality === "Ambos tipos"}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>
                                                            </Col>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label" htmlFor="schoolLocation">¿Qué te gusta hacer?</label>
                                                            <Select
                                                                name="topics"
                                                                options={[
                                                                    { value: 'Arte', label: 'Arte' },
                                                                    { value: 'Música', label: 'Música' },
                                                                    { value: 'Tecnología', label: 'Tecnología' },
                                                                    { value: 'Ciencia', label: 'Ciencia' },
                                                                    { value: 'Literatura', label: 'Literatura' },
                                                                    { value: 'Deportes', label: 'Deportes' },
                                                                    { value: 'Cine', label: 'Cine' },
                                                                    { value: 'Fotografía', label: 'Fotografía' },
                                                                    { value: 'Viajes', label: 'Viajes' },
                                                                    { value: 'Historia', label: 'Historia' },
                                                                    { value: 'Derechos Humanos', label: 'Derechos Humanos' },
                                                                    { value: 'Voluntariado', label: 'Voluntariado' },
                                                                    { value: 'Sostenibilidad', label: 'Sostenibilidad' },
                                                                    { value: 'Ayuda Humanitaria', label: 'Ayuda Humanitaria' },
                                                                    { value: 'Educación', label: 'Educación' },
                                                                    { value: 'Igualdad de Género', label: 'Igualdad de Género' },
                                                                    { value: 'Salud Pública', label: 'Salud Pública' },
                                                                    { value: 'Pobreza', label: 'Pobreza' },
                                                                    { value: 'Refugiados', label: 'Refugiados' },
                                                                    { value: 'Inclusión Social', label: 'Inclusión Social' },                                                                    
                                                                    { value: 'Política', label: 'Política' }
                                                                ]}
                                                                isMulti
                                                                onChange={handleTopicsChange}  // Utiliza el nuevo handleTopicsChange
                                                                className="basic-multi-select"
                                                                classNamePrefix="select"
                                                                id="topicsSelect"
                                                                value={Array.isArray(formData.topics) ? formData.topics.map(value => ({ value, label: value })) : []}  // Mapear para mostrar los valores seleccionados
                                                                isClearable
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="tab-4" className="tab-pane" id="finish">
                                                <form id="finishForm" onSubmit={handleSubmit}>
                                                    <div className="text-center">
                                                        <h3 className="mb-2">Tus Objetivos</h3>
                                                        <small className="text-muted">Cuéntanos sobre tus objetivos y motivaciones para estar en una organizacion.</small>
                                                    </div>
                                                    <div className="row mt-4">
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label className="form-label" htmlFor="goals">Objetivos</label>
                                                                <textarea
                                                                    className="form-control"
                                                                    id="goals"
                                                                    name="goals"
                                                                    placeholder="¿Cuáles son tus objetivos para ser miembro de una organizacion?"
                                                                    value={formData.goals}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label className="form-label" htmlFor="motivations">Motivaciones</label>
                                                                <textarea
                                                                    className="form-control"
                                                                    id="motivations"
                                                                    name="motivations"
                                                                    placeholder="¿Qué te motiva a estar en una organizacion?"
                                                                    value={formData.motivations}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </Tab.Pane>
                                        </Tab.Content>
                                        <div className="d-flex justify-content-center mt-30">
                                            <div className="previous me-2">
                                                <button
                                                    className={`btn btn-secondary ${key === 'tab-1' ? 'disabled' : ''}`}
                                                    onClick={handlePrevious}
                                                    disabled={key === 'tab-1'}
                                                >
                                                    Volver
                                                </button>
                                            </div>
                                            <div className="d-flex next">
                                                {key === `tab-${totalTabs}` ? (
                                                    <button
                                                        className="btn btn-primary mt-3 mt-md-0"
                                                        onClick={handleSubmit} // Llama al handleSubmit en la última pestaña
                                                    >
                                                        Finalizar
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-secondary mt-3 mt-md-0"
                                                        onClick={handleNext}
                                                    >
                                                        Siguiente Paso
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabContainer>
                        </Col>
                    </div>
                </Col>
            </Row>
        </Layout>
    );
};

export default Page;
