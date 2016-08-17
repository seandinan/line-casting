var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xffffff);

var orbitControls = new THREE.TrackballControls(camera, renderer.domElement);
orbitControls.rotateSpeed = 7;
orbitControls.dynamicDampingFactor = 0.4;
orbitControls.maxDistance = 150;
orbitControls.zoomSpeed = 1;
// -----------------------------------------------------------------------------------
var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var isMouseDown = false;
var isAddingPoints = false;
var markCounter = 0, maxCounter = 4;
var maxPoints = 50;
var currentPoint = 0;
var currentLine = null;
var showPointMarkers = false;

function onMouseMove(event){
	if (isAddingPoints && isMouseDown && markCounter === maxCounter && currentPoint <= maxPoints){
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

		ray.setFromCamera(mouse, camera);
		var intersects = ray.intersectObjects(scene.children);
		if (intersects[0] && intersects[0].object.className == 'cube'){
			var point = intersects[0].point;
			var line = scene.getObjectByProperty('uuid', currentLine);

			if (showPointMarkers){
				var dot = new THREE.SphereGeometry(0.3, 4, 4);
				var mat = new THREE.MeshBasicMaterial({color: 'hsl(80, 70%, 60%)'});
				var marker = new THREE.Mesh(dot, mat);
				marker.position.set(point.x, point.y, point.z);
				scene.add(marker);
			}
			if (currentPoint === 0) line.position.set(point.x, point.y, point.z);
			line.geometry.vertices[currentPoint].set(point.x - line.position.x, point.y - line.position.y, point.z - line.position.z);
			currentPoint++;
			line.geometry.verticesNeedUpdate = true;
		}
		markCounter = 0;
	} else if (isMouseDown && markCounter < maxCounter) markCounter++;
}


var geometry = new THREE.BoxGeometry(20, 20, 20);
var material = new THREE.MeshBasicMaterial({color: 'hsl(180, 60%, 50%)', transparent: true});
material.opacity = 0.3;
var cube = new THREE.Mesh(geometry, material);
cube.className = 'cube';
scene.add(cube);

document.body.addEventListener('mouseup', function(){isMouseDown = false; currentPoint = 0;});
document.body.addEventListener('mousedown', function(){
	isMouseDown = true;
	var line = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 'hsl(80, 70%, 50%)', linewidth: 10}));
	line.className = 'line';
	line.geometry.dynamic = true;
	for (var i = 0; i < maxPoints; i++){
		line.geometry.vertices.push(new THREE.Vector3());
	}
	currentLine = line.uuid;
	scene.add(line);
});
document.body.addEventListener('mousemove', onMouseMove);
// -----------------------------------------------------------------------------------
document.querySelector('button').addEventListener('click', function(){
	isAddingPoints = !isAddingPoints;
})
// -----------------------------------------------------------------------------------
function render() {
	requestAnimationFrame(render);
	if (!isAddingPoints) orbitControls.update();
	renderer.render(scene, camera);
}
render();