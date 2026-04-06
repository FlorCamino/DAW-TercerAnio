"use strict";
let nombreUsuario = "Alice";
function saludar(nombre) {
    return `Hola, ${nombre}!`;
}
console.log(saludar(nombreUsuario));
// Punto 6 - Enum para los días de la semana
var DiasSemana;
(function (DiasSemana) {
    DiasSemana["Lunes"] = "Lunes";
    DiasSemana["Martes"] = "Martes";
    DiasSemana["Miercoles"] = "Miercoles";
    DiasSemana["Jueves"] = "Jueves";
    DiasSemana["Viernes"] = "Viernes";
    DiasSemana["Sabado"] = "Sabado";
    DiasSemana["Domingo"] = "Domingo";
})(DiasSemana || (DiasSemana = {}));
// Ejemplo de uso del enum
let hoy = DiasSemana.Miercoles;
console.log("Hoy es:", hoy);
// Punto 7 - Uso de tipo union para una variable que puede ser string o number
let dato;
dato = "Messi";
console.log("Valor string:", dato);
dato = 10;
console.log("Valor number:", dato);
