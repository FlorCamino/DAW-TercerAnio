
// Punto 1 - Interfaz Animal
interface Animal {
  nombre: string;
  gritar(): string;
}

// Punto 2 - Clases que implementan la interfaz Animal
class Perro implements Animal {
  nombre: string;

  constructor(nombre: string) {
    this.nombre = nombre;
  }

  gritar(): string {
    return "Guau";
  }
}

class Gato implements Animal {
  nombre: string;

  constructor(nombre: string) {
    this.nombre = nombre;
  }

  gritar(): string {
    return "Miau";
  }
}

class Vaca implements Animal {
  nombre: string;

  constructor(nombre: string) {
    this.nombre = nombre;
  }

  gritar(): string {
    return "Muuu";
  }
}

// Punto 3 - Función que describe cualquier tipo de Animal 
function describirAnimal(animal: Animal): void {
    console.log(`El animal "${animal.nombre}" hace "${animal.gritar()}".`);
}


// Puntos 4 y 5 - Creación de instancias de animales y pruebas
const perro: Perro = new Perro("Candy");
const vaca: Vaca = new Vaca("Mila");
const gato: Gato = new Gato("Piwi");

console.log("--- Descripción de Animales ---");
describirAnimal(perro);
describirAnimal(vaca);
describirAnimal(gato);


// Punto 8 - Contrato de clase genérica Filas
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



// Crear filas con tipos específicos

// Creación de filas con distintos tipos

// Remover un elemento de cada fila
