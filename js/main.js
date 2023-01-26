export let PTM = 20;
let sprites = [];
let world, particleSystem;
import { gravity } from './gyro.js';
import { LiquidfunSprite } from './lib/liquidfun-renderer.js';
export let renderer;

// let gravity = new Box2D.b2Vec2(0, -10);

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function createBox(x, y, w, h, fixed) {
  let bd = new Box2D.b2BodyDef();
  if (!fixed) {
    bd.set_type(2);
  }
  bd.set_position(new Box2D.b2Vec2(x, y));

  let body = world.CreateBody(bd);

  let shape = new Box2D.b2PolygonShape();
  shape.SetAsBox(w, h);
  body.CreateFixture(shape, 1.0);

  let sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // dunno why this has to be times 2
  sprite.width = w * PTM * 2;
  sprite.height = h * PTM * 2;
  sprite.anchor.set(0.5);
  sprite.body = body;
  renderer.stage.addChild(sprite);
  sprites.push(sprite);
  return body;
}

function createParticleSystem() {
  let psd = new Box2D.b2ParticleSystemDef();
  psd.set_radius(0.1);
  particleSystem = world.CreateParticleSystem(psd);
  particleSystem.SetMaxParticleCount(10000);

  let dummy = PIXI.Sprite.from(PIXI.Texture.EMPTY);
  renderer.stage.addChild(dummy);

  let particleSystemSprite = new LiquidfunSprite(particleSystem);
  renderer.stage.addChild(particleSystemSprite);
}

function spawnParticles(radius, x, y) {
  let color = new Box2D.b2ParticleColor(255, 255, 0, 0);
  // flags
  let flags = 0 << 0;

  let pgd = new Box2D.b2ParticleGroupDef();
  let shape = new Box2D.b2CircleShape();
  shape.set_m_radius(radius);
  pgd.set_shape(shape);
  pgd.set_color(color);
  pgd.set_flags(flags);
  shape.set_m_p(new Box2D.b2Vec2(x, y));
  let group = particleSystem.CreateParticleGroup(pgd);
  return group;
}

function spawnRain() {
  let h = window.innerHeight;
  let x = getRandom(-25, 25);
  let group = spawnParticles(0.1, x, h / 2 / PTM - 0.5);
  //group.ApplyLinearImpulse(wind);
}

function init() {
  // renderer
  let w = window.innerWidth;
  let h = window.innerHeight;
  renderer = new PIXI.Application(w, h, { backgroundColor: 0x000000 });
  document.body.appendChild(renderer.view);

  //let killerShape = new Box2D.b2PolygonShape;
  //killerShape.SetAsBox(w, h);
  //let killerTransform = new Box2D.b2Transform;
  //killerTransform.Set(new Box2D.b2Vec2(0, 0), 0);

  // shift 0/0 to the center
  renderer.stage.position.x = w / 2;
  renderer.stage.position.y = h / 2;

  // world
  world = new Box2D.b2World();

  createBox(0, -h / 2 / PTM - 1, w / PTM, 1, true);
  createBox(0, h / 2 / PTM + 1, w / PTM, 1, true);
  createBox(-w / 2 / PTM - 1, 0, 1, h / PTM, true);
  createBox(w / 2 / PTM + 1, 0, 1, h / PTM, true);

  createParticleSystem();

  renderer.ticker.add(function () {
    for (let i = 0, s = sprites[i]; i < sprites.length; s = sprites[++i]) {
      let pos = s.body.GetPosition();
      s.position.set(pos.get_x() * PTM, -pos.get_y() * PTM);
      s.rotation = -s.body.GetAngle();
    }
  });

  // update loop
  let age = 0;
  function update() {
    //particleSystem.DestroyParticlesInShape(killerShape, killerTransform);
    world.Step(1 / 30, 8, 3);
    if (gravity === undefined) return;

    // Set gravity
    let gravityVec = new Box2D.b2Vec2(gravity.x, gravity.y);
    world.SetGravity(gravityVec);
    age += 1 / 60;
  }
  window.setInterval(update, 1000 / 60);
  // window.setInterval(spawnRain, 10);
  spawnParticles(5, 0, 0);

  renderer.view.addEventListener('touchend', function (e) {
    var evt = typeof e.originalEvent === 'undefined' ? e : e.originalEvent;
    var touch = evt.changedTouches[evt.changedTouches.length - 1];
    let clientX = touch.pageX;
    let clientY = touch.pageY;

    let x = (clientX - renderer.view.offsetLeft - w / 2) / PTM;
    let y = (-(clientY - renderer.view.offsetTop) + h / 2) / PTM;
    if (e.shiftKey) {
      spawnParticles(1, x, y);
    } else {
      createBox(x, y, 1, 1, e.ctrlKey);
    }
  });

  renderer.view.addEventListener('click', function (e) {
    let x = (e.clientX - renderer.view.offsetLeft - w / 2) / PTM;
    let y = (-(e.clientY - renderer.view.offsetTop) + h / 2) / PTM;
    if (e.shiftKey) {
      spawnParticles(1, x, y);
    } else {
      createBox(x, y, 1, 1, e.ctrlKey);
    }
  });
}

window.addEventListener('load', init);
