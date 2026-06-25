(function(){
var STUDY=[
  {s:"+",c:"#7CFF6B",name:"Suma",
   q:"Sumar es juntar cantidades para saber cuánto hay en total. Cada número que sumás se llama <b>sumando</b>.",
   h:"Acomodá unidades debajo de unidades y decenas debajo de decenas. Empezá por la derecha. Si una columna da 10 o más, escribí la unidad y llevá la decena.",
   e:"<b>47 + 38</b>: 7 + 8 = 15 → escribo 5 y me llevo 1. Después 4 + 3 + 1 = 8. Resultado: <span class='r'>85</span>.",
   t:"Antes de terminar, hacé una cuenta aproximada: 47 está cerca de 50 y 38 está cerca de 40. El resultado debería estar cerca de 90.",
   w:"Cuando llevás 1, acordate de sumarlo en la columna siguiente."},
  {s:"−",c:"#18E0FF",name:"Resta",
   q:"Restar puede servir para saber cuánto queda, cuánto se quitó o cuánto falta para llegar a otra cantidad.",
   h:"Empezá por la derecha. Si arriba hay una cifra menor, cambiá 1 decena por 10 unidades. Por ejemplo, 62 pasa a tener 5 decenas y 12 unidades.",
   e:"<b>62 − 28</b>: 2 − 8 no se puede → 12 − 8 = 4. El 6 pasó a 5: 5 − 2 = 3. Da <span class='r'>34</span>.",
   t:"Podés revisar la cuenta con una suma: si 62 − 28 = 34, entonces 34 + 28 tiene que dar 62.",
   w:"En una resta el orden importa: 8 − 2 y 2 − 8 no dan lo mismo."},
  {s:"×",c:"#FF3CAC",name:"Multiplicación",
   q:"Multiplicar es trabajar con grupos iguales. 4 × 6 significa 4 grupos de 6.",
   h:"Usá una tabla que conozcas o separá la cuenta en partes más fáciles. Por ejemplo, 7 × 8 puede pensarse como 7 × 5 + 7 × 3.",
   e:"<b>7 × 8</b> = 8+8+8+8+8+8+8 = <span class='r'>56</span>.",
   t:"Para 7 × 8 también podés hacer 7 × 10 − 7 × 2: 70 − 14 = 56.",
   w:"Podés cambiar el orden de los factores: 4 × 6 = 6 × 4. En matemática esto se llama propiedad conmutativa."},
  {s:"÷",c:"#FFD23F",name:"División",
   q:"Dividir es repartir en grupos iguales o averiguar cuántos grupos iguales se pueden formar.",
   h:"Pensá en la tabla: 56 ÷ 8 pregunta «¿8 por cuánto da 56?». Como 8 × 7 = 56, la respuesta es 7.",
   e:"<b>24 ÷ 6</b> = <span class='r'>4</span>, porque 6 entra 4 veces en 24: 6 + 6 + 6 + 6 = 24.",
   t:"Para revisar una división, multiplicá la respuesta por el número que divide: 7 × 8 = 56.",
   w:"No se puede dividir por 0. Si el reparto no es exacto, lo que sobra se llama resto."},
  {s:"xⁿ",c:"#9D7BFF",name:"Potencia",
   q:"Una potencia es una forma corta de escribir una multiplicación con factores iguales.",
   h:"En 3³, el 3 grande es la <b>base</b> y el 3 pequeño es el <b>exponente</b>. El exponente indica cuántos factores 3 hay.",
   e:"<b>3<sup>3</sup></b> = 3 × 3 × 3 = <span class='r'>27</span>.  Otros: 5<sup>2</sup> = 25, 2<sup>4</sup> = 16.",
   t:"«Al cuadrado» usa 2 factores iguales. «Al cubo» usa 3.",
   w:"3<sup>2</sup> no es 3 × 2. Es 3 × 3 = 9."},
  {s:"√",c:"#FF5C5C",name:"Raíz cuadrada",
   q:"La raíz cuadrada busca el lado de un cuadrado. Pregunta qué número multiplicado por sí mismo produce el número dado.",
   h:"Para √49 preguntate: «¿qué número por sí mismo da 49?». Como 7 × 7 = 49, √49 = 7.",
   e:"<b>√81</b> = <span class='r'>9</span> (porque 9 × 9 = 81). √144 = 12.",
   t:"La tabla de cuadrados perfectos ayuda mucho: 6² = 36, entonces √36 = 6.",
   w:"La raíz no es dividir por 2. √16 = 4, no 8."},
  {s:"M",c:"#2EE6C0",name:"Múltiplos",
   q:"Los múltiplos de un número son los resultados de su tabla. La lista sigue para siempre.",
   h:"Multiplicá el número por 1, 2, 3, 4… Los múltiplos de 5 son 5, 10, 15, 20, 25…",
   e:"¿<b>28</b> es múltiplo de 7? <span class='r'>Sí</span>, porque 7 × 4 = 28.",
   t:"Es múltiplo si al dividir da exacto (resto 0).",
   w:"Los múltiplos son infinitos. Todo número es múltiplo de sí mismo y de 1."},
  {s:"D",c:"#FFB23F",name:"Divisores",
   q:"Un divisor entra una cantidad exacta de veces: al dividir no sobra nada.",
   h:"Probá qué números dividen justo. Los divisores de 12 son 1, 2, 3, 4, 6 y 12.",
   e:"¿<b>6</b> es divisor de 24? <span class='r'>Sí</span>, porque 24 ÷ 6 = 4 exacto. El 5 no lo es porque deja resto.",
   t:"Buscalos en parejas que al multiplicarse den el número: 1×12, 2×6 y 3×4.",
   w:"La lista de divisores termina. Si 4 divide justo a 12, entonces 12 es múltiplo de 4."},
  {s:"MCD",c:"#FF6FC1",name:"Máx. común divisor",
   q:"El MCD es el divisor más grande que comparten dos números.",
   h:"Escribí los divisores de cada número, marcá los que aparecen en las dos listas y elegí el mayor.",
   e:"<b>MCD(12, 18)</b><br>Divisores de 12: 1, 2, 3, 4, 6, 12<br>Divisores de 18: 1, 2, 3, 6, 9, 18<br>Comunes: 1, 2, 3, 6 → <span class='r'>6</span>.",
   t:"Sirve para formar grupos iguales lo más grandes posible. En 7.º también ayuda a simplificar fracciones.",
   w:"MCD empieza con D de divisores: buscá divisores comunes y elegí el mayor."},
  {s:"MCM",c:"#B79CFF",name:"Mín. común múltiplo",
   q:"El MCM es el primer múltiplo que comparten dos números.",
   h:"Escribí los múltiplos de cada número y buscá el primero que aparece en las dos listas.",
   e:"<b>MCM(4, 6)</b><br>Múltiplos de 4: 4, 8, 12, 16…<br>Múltiplos de 6: 6, 12, 18…<br>Primero común: <span class='r'>12</span>.",
   t:"Sirve para saber cuándo coinciden dos ciclos. En 7.º también ayuda a trabajar con fracciones de distinto denominador.",
   w:"MCM empieza con M de múltiplos: buscá el primer múltiplo común."}
];
var LESSONS={
  add:{
    grade:"6.º",
    goal:"Sumar números con seguridad y entender qué hacemos cuando una columna da 10 o más.",
    prior:["Reconocer unidades y decenas","Contar hacia adelante","Sumas hasta 10"],
    context:{icon:"🛒",title:"Una compra compartida",text:"Una remera cuesta $47 y una gorra $38. El total tiene que ser un poco menor que $90.",math:"47 + 38 = 85"},
    visual:"<div class='math-scene place-scene'><div class='place-number'><small>47</small><div><span class='tens'>4 decenas</span><span class='units'>7 unidades</span></div></div><b class='scene-op'>+</b><div class='place-number'><small>38</small><div><span class='tens'>3 decenas</span><span class='units'>8 unidades</span></div></div></div><div class='regroup-strip'><span>7 U + 8 U</span><b>15 U</b><span>1 D + 5 U</span></div><div class='math-result'><span>8 decenas y 5 unidades</span><strong>47 + 38 = 85</strong></div>",
    compare:{bad:"47 + 38 = 715",badNote:"Se escribieron juntas las cifras 7 y 8.",good:"7 + 8 = 15 → escribo 5 y llevo 1",goodNote:"15 unidades son lo mismo que 1 decena y 5 unidades."},
    steps:["Alineá unidades debajo de unidades y decenas debajo de decenas.","Sumá las unidades: 7 + 8 = 15. Escribí 5 y llevá 1 decena.","Sumá las decenas incluyendo la que llevaste: 4 + 3 + 1 = 8.","Estimá el resultado para comprobar que tenga sentido."],
    mental:"Para 39 + 26, pensá 40 + 26 = 66 y después restá 1: da 65.",
    remember:["Sumar es juntar.","Empezá por la derecha.","Si pasás de 9, llevás una decena.","Podés cambiar el orden de los sumandos."],
    quiz:[
      {q:"En 58 + 27, ¿qué hacés con 8 + 7 = 15?",o:["Escribo 5 y llevo 1","Escribo 15 en unidades","Llevo 5"],a:0,e:"En unidades queda el 5; el 1 representa una decena y se lleva."},
      {q:"¿Cuál es una buena estimación para 48 + 33?",o:["Cerca de 80","Cerca de 20","Cerca de 150"],a:0,e:"48 ≈ 50 y 33 ≈ 30; 50 + 30 ≈ 80."}
    ]
  },
  sub:{
    grade:"6.º",
    goal:"Calcular cuánto queda o cuánto falta y comprobarlo con una suma.",
    prior:["Unidades y decenas","Contar hacia atrás","Usar una suma para revisar"],
    context:{icon:"🎮",title:"Puntos que faltan",text:"Tenés 28 puntos y necesitás 62 para desbloquear un nivel. ¿Cuántos faltan?",math:"62 − 28 = 34"},
    visual:"<div class='math-scene hop-line'><span>28</span><i><b>+2</b></i><span>30</span><i class='long'><b>+30</b></i><span>60</span><i><b>+2</b></i><span>62</span></div><div class='math-result'><span>Sumamos lo que avanzamos: 2 + 30 + 2</span><strong>62 − 28 = 34</strong></div>",
    compare:{bad:"2 − 8: cambio el orden y hago 8 − 2",badNote:"Cambiar el orden dentro de una columna altera la cuenta.",good:"1 decena → 10 unidades; ahora 12 − 8",goodNote:"No inventamos unidades: cambiamos una decena por diez unidades."},
    steps:["Mirá de qué cantidad partís y cuánto tenés que quitar.","Empezá por las unidades, a la derecha.","Si arriba hay una cifra menor, cambiá 1 decena por 10 unidades.","Revisá con una suma: resultado + lo que quitaste = cantidad inicial."],
    mental:"Para 62 − 28, contá de 28 a 62: +2, +30 y +2. En total faltan 34.",
    remember:["Restar puede significar quitar o comparar.","El orden cambia el resultado.","Pedir prestado es cambiar 1 decena por 10 unidades.","La suma sirve para comprobar."],
    quiz:[
      {q:"En 72 − 38, ¿por qué el 2 puede convertirse en 12?",o:["Porque cambiamos una decena por 10 unidades","Porque sumamos 10 al resultado","Porque 38 es par"],a:0,e:"Una de las 7 decenas se cambia por 10 unidades; quedan 6 decenas y 12 unidades."},
      {q:"¿Cómo comprobás que 64 − 19 = 45?",o:["45 + 19 = 64","64 + 19 = 45","45 − 19 = 64"],a:0,e:"Sumá el resultado y lo que quitaste: tiene que volver a dar 64."}
    ]
  },
  mul:{
    grade:"6.º",
    goal:"Reconocer grupos iguales y elegir una estrategia cómoda para multiplicar.",
    prior:["Suma repetida","Contar de 2 en 2, de 5 en 5 y de 10 en 10","Dobles"],
    context:{icon:"🎟️",title:"Filas de entradas",text:"Hay 4 filas con 3 entradas en cada fila. Todas las filas tienen la misma cantidad.",math:"4 × 3 = 12"},
    visual:"<div class='math-scene equal-groups'><div><small>grupo 1</small><span>● ● ●</span></div><div><small>grupo 2</small><span>● ● ●</span></div><div><small>grupo 3</small><span>● ● ●</span></div><div><small>grupo 4</small><span>● ● ●</span></div></div><div class='math-result'><span>4 grupos con 3 en cada uno</span><strong>4 × 3 = 12</strong></div>",
    compare:{bad:"4 × 3 = 4 + 3 = 7",badNote:"Sumó los factores una sola vez.",good:"3 + 3 + 3 + 3 = 12",goodNote:"Cuatro grupos iguales de tres forman doce."},
    steps:["Pensá el primer número como cantidad de grupos y el segundo como cantidad en cada grupo.","Usá una tabla que conozcas o una suma repetida.","Si la cuenta es difícil, separá un número en partes más fáciles.","Revisá cambiando el orden: 4 × 6 también puede pensarse como 6 × 4."],
    mental:"Para 7 × 8, usá 7 × 10 − 7 × 2: 70 − 14 = 56.",
    remember:["Multiplicar forma grupos iguales.","Los factores pueden cambiar de orden.","Todo número por 0 da 0.","Descomponer ayuda a calcular mentalmente."],
    quiz:[
      {q:"¿Qué representa 5 × 4?",o:["5 grupos de 4","5 + 4","4 menos 5"],a:0,e:"La multiplicación representa cinco grupos con cuatro elementos cada uno."},
      {q:"¿Qué estrategia sirve para 9 × 6?",o:["10 × 6 − 6","9 + 6","6 × 6 − 10"],a:0,e:"Como 9 es uno menos que 10, calculás 60 − 6 = 54."}
    ]
  },
  div:{
    grade:"6.º",
    goal:"Repartir en partes iguales y usar la multiplicación para revisar el resultado.",
    prior:["Tablas de multiplicar","Restas repetidas","Grupos iguales"],
    context:{icon:"🍕",title:"Reparto justo",text:"Hay 12 porciones para 3 mesas. Cada mesa debe recibir exactamente lo mismo.",math:"12 ÷ 3 = 4"},
    visual:"<div class='math-scene share-groups'><div><small>mesa 1</small><span>🍕 🍕 🍕 🍕</span></div><div><small>mesa 2</small><span>🍕 🍕 🍕 🍕</span></div><div><small>mesa 3</small><span>🍕 🍕 🍕 🍕</span></div></div><div class='math-result'><span>12 porciones repartidas en 3 mesas: 4 para cada una</span><strong>12 ÷ 3 = 4</strong><em>Comprobación: 4 × 3 = 12</em></div>",
    compare:{bad:"12 ÷ 3 = 3",badNote:"Repitió la cantidad de grupos como respuesta.",good:"¿3 por cuánto da 12? Por 4",goodNote:"La respuesta es cuánto recibe cada grupo."},
    steps:["Ubicá el total que se reparte y la cantidad de grupos.","Preguntate qué número multiplicado por la cantidad de grupos da el total.","Si sobra algo, anotá cuánto: eso se llama resto.","Revisá multiplicando lo que recibió cada grupo por la cantidad de grupos."],
    mental:"Para 84 ÷ 7, preguntate: «¿7 por cuánto da 84?». Como 7 × 12 = 84, la respuesta es 12.",
    remember:["Dividir es repartir o formar grupos iguales.","No se puede dividir por 0.","Una multiplicación sirve para revisar.","Si sobra algo, el resto debe ser menor que el número por el que dividís."],
    quiz:[
      {q:"Si repartís 20 fichas entre 5 chicos, ¿qué cuenta ayuda?",o:["20 ÷ 5","20 × 5","20 − 5 una sola vez"],a:0,e:"Se reparte un total de 20 en 5 grupos iguales."},
      {q:"En 17 ÷ 5, ¿cuál puede ser el resto?",o:["2","5","7"],a:0,e:"5 × 3 = 15 y sobran 2. El resto debe ser menor que 5."}
    ]
  },
  pow:{
    grade:"6.º–7.º",
    goal:"Reconocer la base y el exponente, y convertir una potencia en una multiplicación.",
    prior:["Multiplicación","Números repetidos","Leer un número pequeño arriba"],
    context:{icon:"🧊",title:"Capas de un cubo",text:"Un cubo de 3 × 3 × 3 bloques tiene tres dimensiones iguales.",math:"3³ = 27 bloques"},
    visual:"<div class='math-scene power-scene'><div class='power-main'><b>3</b><sup>3</sup><small>el exponente dice<br>cuántos factores usar</small></div><span class='scene-arrow'>→</span><div class='factor-tiles'><b>3</b><i>×</i><b>3</b><i>×</i><b>3</b></div></div><div class='math-result'><span>Tres factores iguales</span><strong>3³ = 3 × 3 × 3 = 27</strong></div>",
    compare:{bad:"3³ = 3 × 3 = 9",badNote:"Usó dos factores aunque el exponente indica tres.",good:"3³ = 3 × 3 × 3 = 27",goodNote:"Contá cuántas veces aparece la base, no cuántas multiplicaciones se ven."},
    steps:["Identificá la base: es el número grande.","Leé el exponente: indica cuántas veces aparece la base como factor.","Escribí la multiplicación repetida.","Multiplicá paso a paso."],
    mental:"Conviene conocer los cuadrados del 1 al 12: 5² = 25, 8² = 64 y 12² = 144.",
    remember:["El exponente no se multiplica por la base.","Exponente 2 se lee «al cuadrado».","Exponente 3 se lee «al cubo».","Contá cuántas veces aparece la base."],
    quiz:[
      {q:"¿Cuál es el desarrollo de 4³?",o:["4 × 4 × 4","4 × 3","3 × 3 × 3 × 3"],a:0,e:"El exponente 3 indica que la base 4 aparece tres veces."},
      {q:"¿Cuánto vale 6²?",o:["36","12","18"],a:0,e:"6² = 6 × 6 = 36."}
    ]
  },
  root:{
    grade:"6.º–7.º",
    goal:"Encontrar el lado de un cuadrado cuando conocemos la cantidad total de casillas.",
    prior:["Potencias al cuadrado","Tablas de multiplicar","Cuadrados perfectos"],
    context:{icon:"🟪",title:"El lado de una cuadrícula",text:"Una imagen cuadrada tiene 16 píxeles organizados en filas y columnas iguales. ¿Cuánto mide cada lado?",math:"√16 = 4"},
    visual:"<div class='math-scene root-scene'><div class='square-grid'>"+Array(16).fill("<i></i>").join("")+"</div><span class='side top'>4</span><span class='side left'>4</span><div class='root-question'><b>16 casillas</b><span>4 filas × 4 columnas</span></div></div><div class='math-result'><span>El lado del cuadrado mide 4</span><strong>√16 = 4</strong></div>",
    compare:{bad:"√16 = 16 ÷ 2 = 8",badNote:"La raíz no busca la mitad.",good:"Busco qué número por sí mismo da 16",goodNote:"4 × 4 = 16, por eso la raíz es 4."},
    steps:["Mirá el número que está dentro de √.","Preguntate qué número multiplicado por sí mismo da ese valor.","Buscalo en la tabla de cuadrados perfectos.","Revisá multiplicando la respuesta por sí misma."],
    mental:"Ubicá el número entre cuadrados conocidos: 64 = 8² y 81 = 9².",
    remember:["La raíz cuadrada deshace el cuadrado.","√49 = 7 porque 7² = 49.","No es dividir el número por 2.","En este juego usamos raíces exactas."],
    quiz:[
      {q:"¿Por qué √36 = 6?",o:["Porque 6 × 6 = 36","Porque 36 ÷ 2 = 18","Porque 3 + 6 = 9"],a:0,e:"La raíz busca el número cuyo cuadrado es 36."},
      {q:"¿Entre qué raíces enteras está √50?",o:["Entre 7 y 8","Entre 5 y 6","Entre 10 y 11"],a:0,e:"7² = 49 y 8² = 64, por eso √50 está apenas por encima de 7."}
    ]
  },
  mlt:{
    grade:"6.º",
    goal:"Armar la lista de múltiplos y reconocer si un número aparece en una tabla.",
    prior:["Tablas de multiplicar","Secuencias","División exacta"],
    context:{icon:"🚌",title:"Una frecuencia que se repite",text:"Un colectivo pasa cada 5 minutos. Los momentos de llegada forman la secuencia 5, 10, 15, 20…",math:"5×1, 5×2, 5×3…"},
    visual:"<div class='math-scene multiple-track'><span>0</span><i></i><span>5</span><i></i><span>10</span><i></i><span>15</span><i></i><span>20</span><i></i><span>25</span></div><div class='track-labels'><b>+5</b><b>+5</b><b>+5</b><b>+5</b><b>+5</b></div><div class='math-result'><span>La secuencia sigue sumando siempre 5</span><strong>5, 10, 15, 20, 25…</strong></div>",
    compare:{bad:"12 es múltiplo de 5 porque es mayor que 5",badNote:"Ser mayor no alcanza.",good:"20 es múltiplo de 5 porque 20 ÷ 5 = 4 exacto",goodNote:"Tiene que pertenecer a la tabla y dejar resto cero."},
    steps:["Elegí el número del que buscás múltiplos.","Multiplicalo por 1, 2, 3, 4 y seguí.","La lista puede continuar para siempre.","Para revisar un número, dividilo por el número base: si no sobra nada, es múltiplo."],
    mental:"Los múltiplos de 2 son pares; los de 5 terminan en 0 o 5; los de 10 terminan en 0.",
    remember:["Los múltiplos son infinitos.","0 es múltiplo de todo número.","Cada número es múltiplo de sí mismo.","Una división exacta confirma la relación."],
    quiz:[
      {q:"¿Cuál de estos números es múltiplo de 6?",o:["42","40","25"],a:0,e:"42 = 6 × 7."},
      {q:"¿Por qué 35 es múltiplo de 5?",o:["Porque 35 ÷ 5 = 7 exacto","Porque es mayor que 5","Porque 3 + 5 = 8"],a:0,e:"La división exacta demuestra que 35 pertenece a la tabla del 5."}
    ]
  },
  dvs:{
    grade:"6.º",
    goal:"Encontrar los números que dividen justo, sin dejar resto.",
    prior:["Divisiones sin resto","Multiplicación","Parejas que dan el mismo resultado"],
    context:{icon:"📦",title:"Armar paquetes iguales",text:"Querés guardar 12 objetos en filas completas. Las cantidades posibles por fila son sus divisores.",math:"1, 2, 3, 4, 6 y 12"},
    visual:"<div class='math-scene pair-cards'><div><span>1</span><i>×</i><span>12</span></div><div><span>2</span><i>×</i><span>6</span></div><div><span>3</span><i>×</i><span>4</span></div></div><div class='math-result'><span>Cada pareja forma exactamente 12</span><strong>Divisores: 1, 2, 3, 4, 6 y 12</strong></div>",
    compare:{bad:"5 es divisor de 12 porque 5 es menor",badNote:"El tamaño no decide si divide.",good:"12 ÷ 4 = 3, resto 0",goodNote:"Si la división es exacta, ambos números forman una pareja de factores."},
    steps:["Empezá con 1, que siempre divide justo.","Buscá parejas que al multiplicarse den el número.","Anotá los dos números de cada pareja.","Cuando las parejas empiecen a repetirse, ya encontraste todos."],
    mental:"Para saber si 3 divide a un número, sumá sus cifras: si esa suma es múltiplo de 3, la división es exacta.",
    remember:["Los divisores son finitos.","1 y el propio número siempre son divisores.","Aparecen en parejas de factores.","Divisor significa resto 0."],
    quiz:[
      {q:"¿Qué pareja de divisores de 24 falta: 1×24, 2×12, 3×8, …?",o:["4 × 6","5 × 5","6 × 6"],a:0,e:"4 × 6 = 24, así que ambos son divisores."},
      {q:"¿Es 7 divisor de 30?",o:["No, porque deja resto","Sí, porque 7 es menor","Sí, porque es primo"],a:0,e:"30 ÷ 7 no es exacto."}
    ]
  },
  mcd:{
    grade:"6.º–7.º",
    goal:"Encontrar el divisor más grande que comparten dos números.",
    prior:["Divisores","Comparar números","Pares de factores"],
    context:{icon:"👥",title:"La mayor cantidad de grupos iguales",text:"Hay 12 tarjetas azules y 18 rojas. Se pueden armar 6 grupos iguales, cada uno con 2 azules y 3 rojas.",math:"MCD(12,18) = 6 grupos"},
    visual:"<div class='math-scene compare-rows'><div><small>Divisores de 12</small><span>1</span><span>2</span><span>3</span><span>4</span><b>6</b><span>12</span></div><div><small>Divisores de 18</small><span>1</span><span>2</span><span>3</span><b>6</b><span>9</span><span>18</span></div></div><div class='math-result'><span>Los comunes son 1, 2, 3 y 6. Elegimos el mayor.</span><strong>MCD(12, 18) = 6</strong></div>",
    compare:{bad:"Elijo 18 porque es el número más grande",badNote:"El resultado tiene que dividir exactamente a ambos.",good:"Entre 1, 2, 3 y 6, el mayor es 6",goodNote:"Primero común; después mayor."},
    steps:["Listá todos los divisores del primer número.","Listá todos los divisores del segundo.","Marcá los que aparecen en ambas listas.","Elegí el común de mayor valor."],
    mental:"Si un número divide exactamente al otro, el menor es el MCD. Por ejemplo, MCD(6, 18) = 6.",
    remember:["En MCD trabajamos con divisores.","Primero marcamos los que aparecen en las dos listas.","Después elegimos el mayor.","Sirve para formar grupos iguales lo más grandes posible."],
    quiz:[
      {q:"Divisores comunes de 8 y 12: 1, 2 y 4. ¿Cuál es el MCD?",o:["4","2","12"],a:0,e:"Entre los divisores comunes, 4 es el mayor."},
      {q:"¿Qué lista necesitás para calcular un MCD?",o:["Divisores","Múltiplos","Potencias"],a:0,e:"La D de MCD recuerda que se buscan divisores."}
    ]
  },
  mcm:{
    grade:"6.º–7.º",
    goal:"Encontrar el primer múltiplo que aparece en las listas de dos números.",
    prior:["Múltiplos","Tablas de multiplicar","Comparar secuencias"],
    context:{icon:"⏱️",title:"Dos ritmos que coinciden",text:"Una luz parpadea cada 4 segundos y otra cada 6. ¿Cuándo vuelven a encenderse juntas?",math:"MCM(4,6) = 12 segundos"},
    visual:"<div class='math-scene compare-rows'><div><small>Múltiplos de 4</small><span>4</span><span>8</span><b>12</b><span>16</span><span>20</span><span>24</span></div><div><small>Múltiplos de 6</small><span>6</span><b>12</b><span>18</span><span>24</span></div></div><div class='math-result'><span>12 es la primera coincidencia.</span><strong>MCM(4, 6) = 12</strong></div>",
    compare:{bad:"Elijo 24 porque aparece en las dos listas",badNote:"Es común, pero no es el primero.",good:"12 es el primer múltiplo compartido",goodNote:"Primero común; después menor."},
    steps:["Escribí varios múltiplos del primer número.","Escribí varios múltiplos del segundo.","Buscá el primer valor que aparece en ambas listas.","Comprobá que ese valor se divida exactamente por los dos."],
    mental:"Con números chicos, escribir las dos listas suele ser la forma más clara. Las listas de 4 y 5 se encuentran por primera vez en 20.",
    remember:["MCM trabaja con múltiplos.","Se busca el primero en común.","Suele ser mayor o igual que los números.","Sirve para averiguar cuándo coinciden ciclos."],
    quiz:[
      {q:"Múltiplos de 3: 3, 6, 9, 12…; de 4: 4, 8, 12… ¿Cuál es el MCM?",o:["12","4","24"],a:0,e:"12 es el primer número que aparece en las dos listas."},
      {q:"¿Qué lista necesitás para calcular un MCM?",o:["Múltiplos","Divisores","Raíces"],a:0,e:"La primera M de MCM recuerda que se buscan múltiplos."}
    ]
  }
};
window.MateArcadeContent={STUDY:STUDY,LESSONS:LESSONS};
})();
