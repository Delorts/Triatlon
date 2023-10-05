class DataController {
    constructor() {
        // Variables limites
        this.VELOCIDAD_MAXIMA = {
            caminata: 7,
            ciclismo: 45,
            natacion: 1.72
        };

        // Tiempo carrera en curso
        this.intervaloCarrera = null;
        this.horalCulminacion = 0;
        this.hora = new Date();

        // Instanciacion de esquemas
        this.Participantes = new Esquema('participantes');
        this.Eventos = new Esquema('eventos');
        this.Seguimiento = new Esquema('seguimiento');
    }

    fijarHora(hora) {
        let formatoHora = hora.split(':');
        this.hora.setHours(formatoHora[0]);
        this.hora.setMinutes(formatoHora[1]);
        this.hora.setSeconds(formatoHora[2]);
        let fecha = this.hora;
        return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:${fecha.getSeconds().toString().padStart(2, '0')}`;
    }

    obtenerHoraDate(hora) {
        let formatoHora = hora.split(':');
        hora = new Date();
        hora.setHours(formatoHora[0]);
        hora.setMinutes(formatoHora[1]);
        hora.setSeconds(parseInt(formatoHora[2]) + 1);
        return hora;
    }

    obtenerHora() {
        let hora = new Date();
        return `${hora.getHours().toString().padStart(2, '0')}:${hora.getMinutes().toString().padStart(2, '0')}:${hora.getSeconds().toString().padStart(2, '0')}`;
    }

    /**
     * Registra los participantes en el esquema (participantes)
     * y llama al renderizado por cada participante registrado
     * para mantener la tabla actualizada ante la vista del usuario
     */
    registro() {
        // Inicializando captura de formulario
        const formRegistro = document.getElementById('frm-registro');
        // Obteniendo data de formulario
        let data = new FormData(formRegistro);

        // validacion de campos
        if (data.get('nombre') === '') {
            return alert('El nombre es un campo obligatorio');
        } else if (data.get('cedula') === '') {
            return alert('El cedula es un campo obligatorio');
        } else if (data.get('cedula').length <= 6 || data.get('cedula').length > 10) {
           return alert('La cedula debe contener almenos (07) a (09) digitos.'); 
        } else if (data.get('municipio') === '') {
            return alert('El municipio es un campo obligatorio');
        } else if (data.get('edad') === '') {
            return alert('El edad es un campo obligatorio');
        } else if (data.get('hora_inicio') === '') {
            return alert('La hora inicio es un campo obligatorio');
        } else if (data.get('hora_fin') === '') {
            return alert('El hora fin es un campo obligatorio');
        }

        // Validacion de datos
        let siExiste = !!this.Participantes.buscar().find(item => item.cedula === data.get('cedula'));

        if (!siExiste) {
            let fueRegistrado = this.Participantes.insertar({
                nombre: data.get('nombre').toUpperCase(),
                cedula: data.get('cedula'),
                municipio: data.get('municipio').toUpperCase(),
                edad: data.get('edad'),
                participa: false
            });

            if (fueRegistrado) {
                this.renderizarParticipantes();
                this.limpiarFormRegistro();
                alert('Registro exitoso!');
            } else {
                alert('Fallo al intentar registrar el participante');
            }
        } else {
            alert('El participante ya se encuentra registrado');
        }
    }

    /**
     * Renderiza la lista de participantes registrados
     * en la coleccion del esquema (participantes)
     */
    renderizarParticipantes() {
        let elemento = document.getElementById('data-participantes');
        let participantes = this.Participantes.buscar();

        if (elemento && participantes && participantes.length > 0) {
            let htmlParticipantes = '';
            participantes.forEach(participante => {
                htmlParticipantes += `
                    <tr>
                        <td>${participante.cedula}</td>
                        <td>${participante.nombre}</td>
                        <td>${participante.edad}</td>
                        <td>${participante.municipio}</td>
                        ${!participante.participa ? `<td><button onclick="dataController.participar(${participante.id})" class="send-form">Participar</button></td>` : ''}
                    </tr>`;
            });

            elemento.innerHTML = htmlParticipantes;
        }
    }

    /**
     * Renderiza la lista de participantes en evento en curso
     * en la coleccion del esquema (seguimiento)
     */
    renderizarSeguimiento(evento, seguimientos) {
        let elemento = document.getElementById('data-seguimiento-' + evento.nombre);
        // let seguimientos = this.Seguimiento.buscar();

        if (elemento && seguimientos && seguimientos.length > 0) {
            let htmlseguimientos = '';
            seguimientos.forEach(seguimiento => {
                htmlseguimientos += `
                    <tr class="${seguimiento.distancia >= evento.distancia ? 'llegada' : !seguimiento.descalificado ? 'corriendo' : 'descalificado'}">
                        <td>${seguimiento.cedula}</td>
                        <td>${seguimiento.nombre}</td>
                        <td>${seguimiento.edad}</td>
                        <td>${seguimiento.municipio}</td>
                        <td>${seguimiento.distancia}</td>
                        <td>${seguimiento.tiempo}</td>
                        <td>${evento.hora_inicio}</td>
                        <td>${seguimiento.hora_llegada || '--:--:--'}</td>
                    </tr>`;
            });

            elemento.innerHTML = htmlseguimientos;
        }
    }

    /**
     * Marca el atleta como participando en los eventos
     * mediente un id de registro
     * @param {number} participanteId
     */
    participar(participanteId) {
        let participante = this.Participantes.buscar().find(part => part.id === participanteId);

        if (participante) {
            this.Participantes.actualizar({
                ...participante,
                participa: true
            });
            this.renderizarParticipantes();
        }
    }

    /**
     * Crear o Actualiza un evento en conjunto con la hora
     * estipulada en el campo de texto tipeado
     * @param {string} evento => nombre de evento
     */
    registrarEvento(evento, horaLlegada = null) {
        const frmEventos = document.getElementById('frm-eventos');
        const data = new FormData(frmEventos);
        let dataEvento = null;
        let horaEvento = data.get('hora-evento');

        if ((horaEvento && horaEvento !== '') || this.obtenerHora()) {
            const evt = this.Eventos.buscar().find(evt => evt.nombre === evento);

            let horaInicio = horaLlegada || this.fijarHora(horaEvento || this.obtenerHora());

            if (!evt) {
                dataEvento = this.Eventos.insertar({
                    nombre: evento,
                    hora_inicio: horaInicio,
                    hora_fin: null,
                    distancia: 80
                });
            } else {
                dataEvento = this.Eventos.actualizar({
                    ...evt,
                    hora_inicio: horaInicio,
                    hora_fin: null,
                    distancia: 80
                });

                // Iniciar evento
                // clearInterval(this.iniciarEvento);
                if (!this.intervaloCarrera) {
                    this.iniciarEvento(dataEvento.id);
                    this.limpiarHora(dataEvento.nombre);
                }
            }
        } else {
            alert('Debe ingresar una hora de culminacion para el evento.');
        }
    }

    iniciarEvento(eventoId) {
        let evento = this.Eventos.buscar().find(item => item.id === eventoId);
        let participantes = this.Participantes.buscar().filter(participante => participante.participa);

        if (evento) {
            if (participantes.length > 0) {
                let seguimientos = [];
                // Ajustando data para evento
                participantes.forEach(({ ...participante }) => {
                    /**
                     * Se eliminar el id del participante para reemplazar
                     * por id de seguimiento y se agrega el id del participante
                     * en otra propiedad (participante_id)
                     */
                    let participante_id = participante.id;
                    delete participante['id'];

                    // Validar si el participante existe para el mismo evento en curso
                    let part = this.Seguimiento.buscar().find(item => item.participante_id === participante_id && item.eventoId === eventoId);

                    if (part) {
                        return;
                    }

                    // Registrando participante en evento en curso
                    seguimientos.push(this.Seguimiento.insertar({
                        ...participante,
                        participante_id,
                        eventoId,
                        distancia: 0,
                        tiempo: 0,
                        descalificado: false
                    }));
                });

                // Se llama al renderizado para la tabla de seguimiento
                this.renderizarSeguimiento(evento, seguimientos);
                this.actualizaSeguimiento(evento);

            }
        } else {
            alert('El evento seleccionado no existe!')
        }
    }

    distanciaRandom(evento) {
        return Math.random() * (this.VELOCIDAD_MAXIMA[evento] + 1);
    }

    formatoDistancia(evento, distancia) {
        return parseFloat(distancia.toFixed(
            evento === 'natacion' ? 2 : 0
        ));
    }

    async actualizaSeguimiento(evento) {
        this.intervaloCarrera = setInterval(() => {
            let horaActual = new Date();

            if (horaActual.getTime() < this.obtenerHoraDate(evento.hora_inicio).getTime()) {
                return
            }

            let seguimientos = this.Seguimiento.buscar().filter(seguimiento => seguimiento.eventoId === evento.id);

            // Actualizar informacion de participantes en seguimiento
            seguimientos.forEach(seguimiento => {
                let distancia = this.distanciaRandom(evento.nombre);
                let distanciaTotal = this.formatoDistancia(evento.nombre, seguimiento.distancia + distancia);
                // Si el participante culmina el evento no sigue contando
                if (distanciaTotal >= evento.distancia || distancia < 1) {
                    if (seguimiento.hasOwnProperty('hora_llegada') === false) {
                        // Actualizar hora
                        this.Seguimiento.actualizar({
                            ...seguimiento,
                            distancia: distanciaTotal,
                            tiempo: seguimiento.tiempo + 1,
                            descalificado: distancia < 1 ? true : false,
                            hora_llegada: distancia < 1 ? undefined : this.obtenerHora()
                        });
                    }

                    return;
                }

                if (seguimiento.descalificado == false) {
                    this.Seguimiento.actualizar({
                        ...seguimiento,
                        distancia: distanciaTotal,
                        tiempo: seguimiento.tiempo + 1,
                        descalificado: distancia < 1 ? true : false
                    });
                }
            });

            seguimientos = this.Seguimiento.buscar().filter(seguimiento => seguimiento.eventoId === evento.id).sort((a, b) => {
                if (a.distancia > b.distancia) {
                    return -1;
                }
            });



            // Validamos si todos los participantes culminaron el evento para detener y reiniciar todo
            if (seguimientos.filter(seguimiento => seguimiento.distancia < evento.distancia).length === 0) {

                seguimientos.sort((a, b) => {
                    if (a.distancia > b.distancia && b.tiempo < a.tiempo) {
                        return -1;
                    }
                });

                this.reiniciarEvento(evento);
            } else if (seguimientos.filter(seguimiento => seguimiento.descalificado === false).length === 0) {
                this.reiniciarEvento(evento);
            }

            this.renderizarSeguimiento(evento, seguimientos);
        }, 1000);
    }

    reiniciarEvento(evento) {
        clearInterval(this.intervaloCarrera);
        this.intervaloCarrera = null;

        // Actualizar fecha culminacion evento
        let horaLlegada = this.fijarHora(this.obtenerHora());
        this.Eventos.actualizar({
            ...evento,
            hora_llegada: horaLlegada
        });


        // Obtener (01) evento sin hora llegada
        evento = this.Eventos.buscar().find(evt => !evt?.hora_llegada);

        if (evento) {
            // Actualizar e Iniciar evento
            this.registrarEvento(evento.nombre, horaLlegada);
            console.info("Evento actualizado", evento);
        }
    }

    limpiarHora() {
        document.getElementsByName('hora-evento')[0].value = "";
    }

    limpiarFormRegistro() {
        document.getElementById('limpiar-formulario').click();
    }
}

/**
 * Inicializa la clase con los metodos necesarios
 * para los eventos de los distintos botones del DOM
 */
const dataController = new DataController();

// Creando eventos
dataController.registrarEvento('caminata');
dataController.registrarEvento('ciclismo');
dataController.registrarEvento('natacion');