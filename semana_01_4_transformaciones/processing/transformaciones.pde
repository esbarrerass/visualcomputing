void setup() {
  size(800, 600, P3D);
  frameRate(60);
}

void draw() {
  background(26, 26, 46);  // azul oscuro

  float t = millis() / 1000.0;

  lights();
  pointLight(255, 200, 100, 200, -200, 300);

  drawUI(t);

  translate(width / 2.0, height / 2.0, 0);

  // cubo principal 
  pushMatrix();
    float tx = sin(t * 0.8) * 180;
    float ty = cos(t * 0.6) * 80;
    translate(tx, ty, 0);

    rotateX(t * 0.7);
    rotateY(t * 1.1);
    rotateZ(t * 0.4);

    float s = 1.0 + 0.4 * sin(t * 2.0);
    scale(s);

    fill(221, 132, 82, 220);
    stroke(255, 180, 100);
    strokeWeight(1);
    box(80);
  popMatrix();

  //esfera hija
  pushMatrix();
    // Traslacion (misma del cubo)
    float tx2 = sin(t * 0.8) * 180;
    float ty2 = cos(t * 0.6) * 80;
    translate(tx2, ty2, 0);

    // Órbita propia alrededor del cubo
    rotateY(t * 2.0);
    translate(110, 0, 0);

    // Escala independiente
    float s2 = 0.5 + 0.2 * sin(t * 3.0);
    scale(s2);

    fill(76, 114, 176, 200);
    stroke(100, 150, 255);
    strokeWeight(1);
    sphere(40);
  popMatrix();

  pushMatrix();
    fill(85, 168, 104, 120);
    stroke(100, 220, 130);
    strokeWeight(1);
    rotateY(t * 0.2);
    box(20, 20, 20);
  popMatrix();
}

void drawUI(float t) {
  hint(DISABLE_DEPTH_TEST);
  camera();  
  noLights();

  float tx = sin(t * 0.8) * 180;
  float ty = cos(t * 0.6) * 80;
  float s  = 1.0 + 0.4 * sin(t * 2.0);

  fill(0, 0, 0, 140);
  noStroke();
  rect(10, 10, 260, 120, 8);
  
  textSize(13);
  textAlign(LEFT, TOP);
  fill(255);
  text("Transformaciones", 20, 18);
  fill(221, 132, 82);
  text("Cubo  tx=" + String.format("%.1f", tx) + "  ty=" + String.format("%.1f", ty), 20, 38);
  text("      rot XYZ  scale=" + String.format("%.2f", s), 20, 54);
  fill(76, 114, 176);
  text("🔵 Esfera orbita + escala propia", 20, 70);
  fill(85, 168, 104);
  text("🟢 Origen (referencia)", 20, 86);
  fill(180);
  text("t = " + String.format("%.2f", t) + "s   frame = " + frameCount, 20, 104);

  hint(ENABLE_DEPTH_TEST);
  perspective();
  camera();
}
