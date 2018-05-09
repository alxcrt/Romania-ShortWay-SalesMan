let cities = [];

let recordDistance;

let table;
let zoom = 5.75;

let clat=45.9432;
let clon=24.9668;

let bestEver;
let f;
// let lat= 44.18;
// let lon= 28.63;


let temp = 100000;
let coolingRate = 0.003;

function preload(){
	table = loadTable('RO_LOC.csv', 'header');
	// maping = loadImage('ro.svg');
	maping = loadImage("https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/24.9668,45.9432,5.75,0,0/1024x512?access_token=pk.eyJ1IjoiYXhlbGxiZW4iLCJhIjoiY2pneHc0a2o2MGlkcTJ3bGxtdHB1cXoycSJ9.BRtJfvAR2e_5nA3irA2KSg")


}

function setup() {

	createCanvas(1024,512);
	translate(width/2,height/2);
	imageMode(CENTER);
	image(maping, 0 ,0);

	let	 cx = mercX(clon);
	let cy = mercY(clat);
	for(let i =0 ;i<table.rows.length;i++){

		let lat =table.get(i,0);
		let lon = table.get(i,1);
		let x = mercX(lon) - cx;
		let y = mercY(lat) - cy;

		let v = createVector(x,y);

		cities[i]= v;
	}
	console.log("Initial solution is : " + calcDistance(cities));

	bestEver=cities;


}


function mercX(lon){
	lon = radians(lon);
	let a = (256/PI)*pow(2,zoom);
	let b = (lon+PI);
	return a*b;
}

function mercY(lat){
	lat = radians(lat);
	let a = (256/PI)*pow(2,zoom);
	let b = tan(PI/4+lat/2);
	let c = PI-log(b);
	return a*c;
}

function draw(){
	cities = shuffle(cities);
	createCanvas(1024,512);
	translate(width/2,height/2);
	imageMode(CENTER);
	image(maping, 0 ,0);


	// background(0);
	// translate(width/2,height/2);


	fill(255,0,255);
	for(let i = 0;i < cities.length  ;i++){
		ellipse(cities[i].x,cities[i].y,10,10);
	}

	stroke(255);
	strokeWeight(0.25);
	noFill();
	beginShape();
	for(let i = 0;i < bestEver.length ;i++){
		noFill();
		vertex(bestEver[i].x,bestEver[i].y);


	}
	endShape();


	let improve = true;
	while(improve){
		//Algorithm 2opsSwap
		improve = false;
		let recordDistance = calcDistance(cities);

		for(i=0;i<cities.length;i++){
			for(let j= i+1;j<cities.length-1;j++){
					let new_route = twooptSwap(cities,i,j);
					new_distance = calcDistance(new_route);
					if(new_distance<recordDistance){
						recordDistance = new_distance;

						cities = new_route;
						improve = true;
					}
					if(recordDistance<calcDistance(bestEver)){
						bestEver = new_route;
					}
			}
		}
	}

	fill(255);
	textSize(45);
	text(int(calcDistance(bestEver))+" KM",300,200);


}


function calcDistance(points){
	var sum = 0;
	let d;
	for(let i =0;i<points.length ;i++){
		if(i+1<points.length){
		d = dist(points[i].x,points[i].y,points[i+1].x,points[i+1].y);

	}
	else{
		d = dist(points[0].x,points[0].y,points[points.length-1].x,points[points.length-1].y);
	}
			sum+=d;
	}
	return sum;
}


function twooptSwap(route,i,k){
	let new_route = [];
	for(let j=0;j<i;j++){
		new_route=new_route.concat(route[j]);
	}
	for(let j=k;j>=i;j--){
		new_route=new_route.concat(route[j]);
	}
	for(let j=k+1;j<route.length;j++){
		new_route=new_route.concat(route[j]);
	}
	return new_route;
}

function swap(a,i,j){
	let k = a[i];
	a[i] = a[j];
	a[j] = k;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


function acceptanceProbability( distance, newDistance, temperature ){
	if(newDistance < distance){
		return 1.0;
	}
	return (Math.exp(distance - newDistance)/temperature );
}


function simulatedAnnealing(){
	while(temp > 1){
		let new_cities = cities;

		let i = floor(random(new_cities.length));
		let j = floor(random(new_cities.length));

		swap(new_cities,i,j);

		let distance = calcDistance(cities);
		let new_distance = calcDistance(new_cities);

		if(acceptanceProbability(distance,new_distance,temp)>Math.random()){
			cities = new_cities;
		}

		if(calcDistance(cities)< calcDistance(bestEver)){
			bestEver = cities;
		}

		temp = temp *( 1- coolingRate);


	}
}
