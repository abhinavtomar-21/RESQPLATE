async function run() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6Lhgp7z6tXXTjkHnp_oqcjMV5lKO662cR8DmBj-Dxm6QA');
  const data = await res.json();
  console.log(data.models.map(m => m.name).join(', '));
}
run();
