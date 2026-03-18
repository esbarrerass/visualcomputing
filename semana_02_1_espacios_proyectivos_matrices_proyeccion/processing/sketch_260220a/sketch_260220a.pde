void setup() {
  size(800, 600, P3D);
}

boolean withPerspective = true;

void draw() {
  background(30);
  lights();
  
  if(!withPerspective){
    ortho();
  }

  translate(width/2, height/2, 0);


  pushMatrix();
  translate(-100, 0, -100);
  fill(255, 0, 0);
  box(80);
  popMatrix();

  pushMatrix();
  translate(0, 0, -300);
  fill(0, 255, 0);
  box(80);
  popMatrix();

  pushMatrix();
  translate(100, 0, -500);
  fill(0, 0, 255);
  box(80);
  popMatrix();
}
