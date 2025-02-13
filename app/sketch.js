let boids = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create a flock of boids (pixel blocks)
  for (let i = 0; i < 50; i++) {
    boids.push(new Boid(random(width), random(height)));
  }
}

function draw() {
  background(30);
  for (let boid of boids) {
    boid.edges();
    boid.flock(boids);
    boid.update();
    boid.show();
  }
}

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 3;
  }
  
  // Apply flocking behaviors plus an attraction to the mouse
  flock(boids) {
    let perceptionRadius = 50;
    let alignment = createVector();
    let cohesion = createVector();
    let separation = createVector();
    let total = 0;
    
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < perceptionRadius) {
        alignment.add(other.velocity);
        cohesion.add(other.position);
        
        // Calculate repulsion vector for separation
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d);
        separation.add(diff);
        total++;
      }
    }
    
    if (total > 0) {
      // Alignment: steer towards the average heading
      alignment.div(total);
      alignment.setMag(this.maxSpeed);
      alignment.sub(this.velocity);
      alignment.limit(this.maxForce);
      
      // Cohesion: steer towards the average position
      cohesion.div(total);
      cohesion.sub(this.position);
      cohesion.setMag(this.maxSpeed);
      cohesion.sub(this.velocity);
      cohesion.limit(this.maxForce);
      
      // Separation: steer to avoid crowding
      separation.div(total);
      separation.setMag(this.maxSpeed);
      separation.sub(this.velocity);
      separation.limit(this.maxForce);
    }
    
    // Attraction: steer towards the mouse pointer
    let mouse = createVector(mouseX, mouseY);
    let attraction = p5.Vector.sub(mouse, this.position);
    attraction.setMag(this.maxSpeed);
    attraction.sub(this.velocity);
    attraction.limit(this.maxForce);
    
    // Weight and sum the forces
    this.acceleration.add(alignment);         // alignment force
    this.acceleration.add(cohesion.mult(0.5));    // cohesion (weighted less)
    this.acceleration.add(separation.mult(1.5));  // separation (weighted more)
    this.acceleration.add(attraction);          // follow the mouse
  }
  
  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }
  
  // Wrap around screen edges
  edges() {
    if (this.position.x > width)  this.position.x = 0;
    if (this.position.x < 0)      this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0)      this.position.y = height;
  }
  
  // Draw the boid as a small pixel block
  show() {
    fill(255);
    noStroke();
    rect(this.position.x, this.position.y, 4, 4);
  }
}
