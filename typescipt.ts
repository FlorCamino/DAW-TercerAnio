let nombreUsuario: string = "Alice";

function saludar(nombre: string): string {
    return `Hola, ${nombre}!`;
}   

console.log(saludar(nombreUsuario));

// Punto 6
enum DiasSemana {
  Lunes = "Lunes",
  Martes = "Martes",
  Miercoles = "Miercoles",
  Jueves = "Jueves",
  Viernes = "Viernes",
  Sabado = "Sabado",
  Domingo = "Domingo"
}

// Ejemplo del punto 6
let hoy: DiasSemana = DiasSemana.Miercoles;
console.log("Hoy es:", hoy);

// Punto 7
let dato: string | number;

dato = "Messi";
console.log("Valor string:", dato);

dato = 10;
console.log("Valor number:", dato);