# 📄 Acta Matrimonial - Especificación Técnica para Generación de PDF

## 🎯 OBJETIVO
Generar un PDF con diseño formal eclesiástico replicando un acta matrimonial, incluyendo:
- Marco decorativo como fondo (imagen)
- Escudo superior centrado
- Encabezados centrados
- Cuerpo del texto justificado
- Firmas alineadas correctamente

---

## 🧱 1. CONFIGURACIÓN GENERAL

- Tamaño: Carta (21.59 cm x 27.94 cm)
- Orientación: Vertical
- Márgenes:
  - Superior: 2.5 cm
  - Inferior: 2.5 cm
  - Izquierdo: 2.5 cm
  - Derecho: 2.5 cm

- Fuente:
  - Familia: Times New Roman (o serif)
  - Tamaño base: 12px
  - Color: #000000

---

## 🖼️ 2. ELEMENTOS GRÁFICOS

### 🟫 2.1 Marco (FONDO)

IMPORTANTE: El marco debe ser una IMAGEN, no CSS.

- Ruta:
  public/marco.png

- Configuración:
  - position: absolute
  - top: 0
  - left: 0
  - width: 100%
  - height: 100%
  - z-index: -1
  - Debe cubrir toda la hoja
  - No deformar imagen

---

### 🛡️ 2.2 Escudo

- Ruta:
  /public/escudo.png

- Configuración:
  - Centrado horizontal
  - Margen superior: 1.5 cm
  - Ancho: 80px – 120px
  - Mantener proporción

---

## 🧾 3. ENCABEZADO

### Texto principal:
ARQUIDIOCESIS DE BUCARAMANGA

- Alineación: centro
- Tamaño: 14px – 16px
- Peso: bold
- Mayúsculas
- Margen inferior: 10px

---

### Subtítulo:
<parroquia> DE FLORIDABLANCA (SANTANDER)

- Alineación: centro
- Tamaño: 12px – 14px
- Mayúsculas
- Margen inferior: 25px

---

## 🏷️ 4. TÍTULO

ACTA MATRIMONIAL

- Alineación: centro
- Tamaño: 20px
- Peso: bold
- Margen inferior: 30px

---

## ✍️ 5. CUERPO DEL TEXTO

Contenido:

El suscrito cura párroco de <parroquiaconciudad> hace constar  
Que  
<novios>  
Celebraron matrimonio sacramental en esta parroquia el <fecha>  
En presencia del presbítero <ministro>.  
Y de <testigos> como testigos.

---

Configuración:

- Alineación: justificado
- Interlineado: 1.5
- Tamaño: 12px

Reglas:

- "Que" va en línea separada
- <novios> en negrita (opcional)
- <fecha> formato largo (ej: 24 de abril de 2026)

---

## ✒️ 6. FIRMAS

### Contrayentes

__________________________________________    __________________________________________  
Firma de los contrayentes

- Dos líneas
- Una izquierda y otra derecha
- Separación: 20px

---

### Sacerdote

__________________________________________________________________  
Firma del sacerdote que presenció el matrimonio

- Línea centrada
- Ancho: 70%

---

### Testigos

__________________________________________    __________________________________________  
Firma de los testigos

---

### Párroco y sello

__________________________________________________________________  
Firma del párroco  
Sello de la parroquia

---

## 📐 7. ESPACIADOS

- Entre secciones: 20px – 30px
- Antes de firmas: mínimo 40px

---

## 🧠 8. JERARQUÍA

- Título: 20px bold centrado
- Encabezado: 14px bold centrado
- Subencabezado: 12px centrado
- Cuerpo: 12px justificado
- Firmas: 11px centrado

---

## 🧩 9. VARIABLES DINÁMICAS

- <parroquia>
- <parroquiaconciudad>
- <novios>
- <fecha>
- <ministro>
- <testigos>

---

## 🛠️ 10. HTML BASE

```html
<div class="page">
  <img src="/assets/marco.png" class="background"/>
  <img src="/assets/escudo.png" class="escudo"/>

  <h1>ARQUIDIOCESIS DE BUCARAMANGA</h1>
  <h2>{{ parroquia }}</h2>

  <h3>ACTA MATRIMONIAL</h3>

  <p class="content">
    El suscrito cura párroco de {{ parroquiaCiudad }} hace constar...
  </p>

  <div class="firmas"></div>
</div>