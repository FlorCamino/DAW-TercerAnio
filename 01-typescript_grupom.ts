/**
 * Trabajo Práctico: Introducción a TypeScript
 * Materia: Desarrollo de Aplicaciones Web - 2026
 *
 * Grupo: M
 *
 * Integrantes:
 * - Franco Challiol
 * - Janet Casaretto
 * - Damian Ottone
 * - Micaela Zalazar
 * - Florencia Camino
 */

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
    console.log(`El animal ${animal.nombre} hace ${animal.gritar()}`);
}


// Puntos 4 y 5 - Creación de instancias de animales y pruebas
const perro: Perro = new Perro("Candy");
const vaca: Vaca = new Vaca("Mila");
const gato: Gato = new Gato("Piwi");

console.log("--- Descripción de Animales ---");
describirAnimal(perro);
describirAnimal(vaca);
describirAnimal(gato);

// Punto 6 - Enum con los días de la semana
enum DiasSemana {
  Lunes = "Lunes",
  Martes = "Martes",
  Miercoles = "Miércoles",
  Jueves = "Jueves",
  Viernes = "Viernes",
  Sabado = "Sábado",
  Domingo = "Domingo"
}

// Variable que almacena un día de la semana
let hoy: DiasSemana = DiasSemana.Miercoles;
console.log("Hoy es:", hoy);

// Punto 7 - Variable que acepta string o number
let dato: string | number;
dato = "Messi";
console.log("Valor string:", dato);
dato = 10;
console.log("Valor number:", dato);

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

// Punto 9 - Crear filas con tipos específicos

const filaNumeros = new FilaGenerica<number>();
const filaStrings = new FilaGenerica<string>();
const filaAnimales = new FilaGenerica<Animal>();

// Punto 10 - Agregar las 3 instancias anteriores en la fila para animales y 3 elementos en las otras 2 filas

filaAnimales.agregar(perro);
filaAnimales.agregar(vaca);
filaAnimales.agregar(gato);

filaNumeros.agregar(13);
filaNumeros.agregar(1);
filaNumeros.agregar(20);

filaStrings.agregar("Primer elemento");
filaStrings.agregar("Segundo elemento");
filaStrings.agregar("Tercer elemento");

console.log("--- Se agregaron 3 elementos a cada fila ---");
console.log("Fila de Animales:", filaAnimales.obtenerElementos());
console.log("Fila de Números:", filaNumeros.obtenerElementos());
console.log("Fila de Strings:", filaStrings.obtenerElementos());

// Remover un elemento de cada fila

filaAnimales.remover();
filaNumeros.remover();
filaStrings.remover();

console.log("--- Se quitó un elemento de cada fila ---");
console.log("Resultado Fila de Animales:", filaAnimales.obtenerElementos());
console.log("Resultado Fila de Números:", filaNumeros.obtenerElementos());
console.log("Resultado Fila de Strings:", filaStrings.obtenerElementos());