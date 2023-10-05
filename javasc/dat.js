class Esquema {
    constructor(modelo) {
        this.data = {};
        this.modelo = modelo;
    }

    // insertar data
    insertar(datos) {
        if (!this.modelo || this.modelo === '') {
            return null;
        }

        let mdl = this.modelo;
        if (this.data) {
            let id = this.data[mdl]?.length + 1;

            id = isNaN(id) ? 1 : id;
            this.data[mdl] = [...this.data[mdl] || [], ...[{ ...datos, id }]];
            return { ...datos, id };
        }
    }

    // buscar registro
    buscar(llaves) {
        if (!this.modelo || this.modelo === '') {
            return null;
        }

        return this.data[this.modelo ?? modelo] || [];
    }

    actualizar(datos) {
        if (!this.modelo || this.modelo === '') {
            return null;
        }

        let mdl = this.modelo;
        if (this.data) {
            let indexData = this.data[mdl].findIndex(item => item.id === datos.id);

            if (indexData > -1) {
                this.data[mdl][indexData] = datos;
                return this.data[mdl][indexData];
            }
        }
    }

    borrar(datos) {
        if (!this.modelo || this.modelo === '') {
            return null;
        }

        let mdl = this.modelo;

        if (this.data && this.data[mdl]) {
            let indexData = this.data[mdl].findIndex(item => item.id === datos.id);

            delete this.data[mdl][indexData];
            let nuevaData = this.data[mdl].filter(item => item);
            this.data[mdl] = nuevaData;
            return nuevaData;
        }
    }

    truncar() {
        if (!this.modelo || this.modelo === '') {
            return null;
        }

        let mdl = this.modelo;

        if (this.data && this.data[mdl]) {
            this.data[mdl] = null;
        }
    }
}