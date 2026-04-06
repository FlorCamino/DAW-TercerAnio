
// Interface que define el contrato para todos los animales

// Implementacion de clase perro, gato y vaca que heredan la interfaz de Animal


// Función que describe cualquier tipo de Animal 
function describirAnimal(animal: Animal): void {
    console.log(`El animal "${animal.nombre}" hace "${animal.gritar()}".`);
}

// Contrato de clase genérica Fila
interface Fila<T> {
agregar(elemento: T): void;
remover(): T | undefined;
}

// Implementacion de clase genérica Fila que hereda la interfaz de Fila

class FilaGenerica<T> implements Fila<T> {
    private elementos: T[] = [];
    agregar(elemento: T): void {
        this.elementos.push(elemento);
    }
    
    remover(): T | undefined {
        return this.elementos.shift();
    }   
    obtenerElementos(): T[] {
        return this.elementos;
    }
}

// Enum con los días de la semana

// Variable que acepta string o number

// Creación de instancias de animales y pruebas

// Crear filas con tipos específicos

// Creación de filas con distintos tipos

// Remover un elemento de cada fila