/**
 * @author syt123450 / https://github.com/syt123450
 */

import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
// import * as Stats from "stats-js";
import { TrackballControls } from "three";
import { DefaultCameraPos, DefaultLayerDepth } from "../utils/Constant";
import { MouseCaptureHelper } from '../utils/MouseCapturer';
import { ModelRenderer } from './ModelRenderer';
import { VRButton } from '../../node_modules/three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from '../../node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from '../../node_modules/three/examples/jsm/webxr/XRHandModelFactory.js';

let posicion_final_derecho = null;
let posicion_final_izquierdo = null;
let primer_inicio = true;
let posicion_derecha = null;
let posicion_izquierda = null;

const desplazamiento = 0.1;
const zoom = 0.0001;
const mov = 0.0001;
const rotacion = 0.45;
const umbral_rotacion = 0.5;

function Web3DRenderer( tspModel, handlers ) {
	console.log("Pasamos por aqui: Web3DRenderer")
	
	ModelRenderer.call( this, tspModel, handlers );
	
	this.container = tspModel.container;
	
	this.scene = undefined;
	this.camera = undefined;
	this.stats = undefined;
	this.renderer = undefined;
	this.clock = undefined;
	this.cameraControls = undefined;
	this.raycaster = undefined;
	this.mouse = undefined;
	this.handedness = undefined;
	this.prevGamePads = undefined;
	this.user = undefined;
	this.modelo = undefined;

	// control whether to show Stats panel, configured by Model Configuration
	this.hasStats = undefined;
	
	this.backgroundColor = undefined;
	
	this.sceneArea = undefined;
	
	this.domParams = {
		
		left: undefined,
		top: undefined,
		width: undefined,
		height: undefined
		
	};
	
	this.loadSceneConfig( tspModel.configuration );
	this.initXR();
	
}

Web3DRenderer.prototype = Object.assign( Object.create( ModelRenderer.prototype ), {
	
	init: function() {
		
		this.createScene();
		this.registerEvent();
		this.animate();
		
	},

	initXR: function () {
		if ('xr' in navigator) {
			navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
				if (supported) {
					document.getElementById('VRButton').style.display = '';
				}
			}
			);
		
		} 
	},

	
	reset: function() {
		
		this.cameraControls.reset();
		this.updateCamera();
		
	},
	
	loadSceneConfig: function( config ) {
		
		this.hasStats = config.stats;
		this.backgroundColor = config.color.background;
		
	},
	
	createScene: function() {
		
		let sceneArea = document.createElement( "canvas" );
		
		this.sceneArea = sceneArea;
		
		this.setSceneSize();
		
		sceneArea.style.backgroundColor = this.backgroundColor;
		
		this.clock = new THREE.Clock();
		
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x000 );

		// cambiamos escala del tspModel
		this.tspModel.modelContext.scale.set(0.01,0.01,0.01);
		this.scene.add( this.tspModel.modelContext );

		this.modelo = new THREE.Group();
		this.modelo.name = "modelo";
		this.modelo.position.set(0, 0, 0);
		
		this.user = new THREE.Group();
		this.user.name = "user";
		this.user.position.set(0, 0, 0.81);
		
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set( 0, 0, 0 );
		
		this.camera.updateProjectionMatrix();
		this.camera.name = 'defaultCamera';

		this.user.add( this.camera );
		this.scene.add( this.user );
		
		this.modelo.add( this.tspModel.modelContext );
		this.scene.add( this.modelo );

		const light = new THREE.DirectionalLight( 0xffffff, 3 );
		light.position.set( 0, 6, 0 );
		light.castShadow = true;
		light.shadow.camera.top = 2;
		light.shadow.camera.bottom = - 2;
		light.shadow.camera.right = 2;
		light.shadow.camera.left = - 2;
		light.shadow.mapSize.set( 4096, 4096 );
		this.scene.add( light );

		// renderer
		this.renderer = new THREE.WebGLRenderer( {
			canvas: sceneArea,
			antialias: true
		} );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( sceneArea.width, sceneArea.height );
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.shadowMap.enabled = true;
		this.renderer.xr.enabled = true;

		document.body.appendChild(VRButton.createButton(this.renderer));

		this.renderer.setAnimationLoop(() => {
			this.animate();
		});

		this.container.appendChild( this.renderer.domElement );

		// controllers

		const controller1 = this.renderer.xr.getController( 0 );
		this.scene.add( controller1 );

		const controller2 = this.renderer.xr.getController( 1 );
		this.scene.add( controller2 );

		const controllerModelFactory = new XRControllerModelFactory();
		const handModelFactory = new XRHandModelFactory()

		// Hand 1
		const controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
		controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
		this.scene.add( controllerGrip1 );

		const hand1 = this.renderer.xr.getHand( 0 );
		hand1.addEventListener( 'pinchstart', () => { console.log("pinchstart") } );
		hand1.addEventListener( 'pinchend', () => { console.log("pinchend") } );
		hand1.add( handModelFactory.createHandModel( hand1 ) );
		this.scene.add( hand1 );

		// Hand 2
		const controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
		controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
		this.scene.add( controllerGrip2 );
		
		const hand2 = this.renderer.xr.getHand( 0 );
		hand2.addEventListener( 'pinchstart', () => { console.log("pinchstart") } );
		hand2.addEventListener( 'pinchend', () => { console.log("pinchend") } );
		hand2.add( handModelFactory.createHandModel( hand2 ) );
		this.scene.add( hand2 );

		const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
		 
		const line = new THREE.Line( geometry );
		line.name = 'line';
		line.scale.z = 1;

		// hacemos un circulo al final de la línea
		const geometryCircle = new THREE.CircleGeometry( 0.02, 32 );
		const materialCircle = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
		const circle = new THREE.Mesh( geometryCircle, materialCircle );
		circle.position.set(0, 0, -1);
		line.add( circle );

		controller1.add( line.clone() );
		controller2.add( line.clone() );

		// añadimos los controlladores con las líneas a this.user

		this.user.add( controller1 );
		this.user.add( controller2 );
		
		this.user.add( controllerGrip1 );
		this.user.add( controllerGrip2 );

		this.user.add( hand1 );
		this.user.add( hand2 );
		
		window.addEventListener( 'resize', () => this.resize() );
		
		if ( this.hasStats ) {
			
			if ( typeof Stats !== 'undefined' ) {
				
				this.stats = new Stats();
				this.stats.dom.style.position = "absolute";
				this.stats.dom.style.zIndex = "1";
				this.stats.showPanel( 0 );
				this.container.appendChild( this.stats.dom );
				
			} else {
				
				import('stats-js')
				.then((module) => {
					
					this.stats = new module();
					this.stats.dom.style.position = "absolute";
					this.stats.dom.style.zIndex = "1";
					this.stats.showPanel( 0 );
					this.container.appendChild( this.stats.dom );
					
				})
				.catch(() => {
					
					if ( typeof Stats !== 'undefined' ) {
						
						this.stats = new Stats();
						this.stats.dom.style.position = "absolute";
						this.stats.dom.style.zIndex = "1";
						this.stats.showPanel( 0 );
						this.container.appendChild( this.stats.dom );
						
					} else if ( typeof window === 'undefined' ) {
						
						console.error('Please import stats-js');
						
					} else  {
						
						console.error('Please include  <script> tag');
						
					}
					
				});
				
			}
			
		}
		
		if (THREE.TrackballControls !== undefined) {
			
			this.cameraControls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
			
		} else {
			
			this.cameraControls = new TrackballControls( this.camera, this.renderer.domElement );
			
		}
		
		this.cameraControls.target.set( 0, 0, 0 );
		
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		
		this.cacheDomParams( this.getDomParams() );
		
		this.updateCamera();
		
	},
	
	updateCamera: function() {
		
		let modelDepth = this.tspModel.depth;
		let controlRatio = getControlRatio( modelDepth );
		
		this.camera.position.set(
			
			5,
			1.7,
			2.9
		
		);
		
		// as strategy can not directly be applied to model when layer depth is too small, add a control ratio to move camera farther
		function getControlRatio( depth ) {
			
			if ( depth > 5 ) {
				
				return 1;
				
			} else if ( depth >= 3 && depth < 5 ) {
				
				return 1.5;
				
			} else {
				
				return 2;
				
			}
			
		}
		
	},
	
	// use animate scene
	animate: function() {
		this.tocando = false;
		
		let delta = this.clock.getDelta();
		
		this.cameraControls.update( delta );
		
		if ( this.hasStats ) {
			
			this.stats.update();
			
		}
		
		const tempDomParams = this.getDomParams();
		
		const isDomPosChange = this.isDomPosChange( tempDomParams );
		const isDomSizeChange = this.isDomSizeChange( tempDomParams );
		
		if ( isDomSizeChange ) {
			
			this.onResize();
			
		}
		
		if ( isDomPosChange || isDomSizeChange ) {
			
			this.cameraControls.handleResize();
			this.cacheDomParams( tempDomParams );
			
		}
		
		TWEEN.update();
		
		this.renderer.render( this.scene, this.camera );
		
		requestAnimationFrame( function() {
			
			this.animate();
			
		}.bind( this ) );

		this.VRInteractions();
		
	},
	
	registerEvent: function() {
		
		window.addEventListener( 'resize', function() {
			
			this.onResize();
			
		}.bind( this ), false );
		
		this.sceneArea.addEventListener( 'mousemove', function( event ) {
			
			this.onMouseMove( event );
			
		}.bind( this ), true );
		
		this.sceneArea.addEventListener( 'click', function( event ) {
			
			this.onClick( event );
			
		}.bind( this ), true );
		
	},
	
	onResize: function() {
		
		this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
		this.cameraControls.handleResize();
		
	},
	
	setSceneSize: function() {
		
		let cs = getComputedStyle( this.container );
		
		let paddingX = parseFloat( cs.paddingLeft ) + parseFloat( cs.paddingRight );
		let paddingY = parseFloat( cs.paddingTop ) + parseFloat( cs.paddingBottom );
		
		let borderX = parseFloat( cs.borderLeftWidth ) + parseFloat( cs.borderRightWidth );
		let borderY = parseFloat( cs.borderTopWidth ) + parseFloat( cs.borderBottomWidth );
		
		this.sceneArea.width = this.container.clientWidth - paddingX - borderX;
		this.sceneArea.height = this.container.clientHeight - paddingY - borderY;
		
	},
	
	cacheDomParams: function( domParams ) {
		
		this.domParams.left = domParams.left;
		this.domParams.top = domParams.top;
		this.domParams.width = domParams.width;
		this.domParams.height = domParams.height;
		
	},
	
	getDomParams: function() {
		
		let box = this.container.getBoundingClientRect();
		let d = this.container.ownerDocument.documentElement;
		
		const domParams = {};
		
		domParams.left = box.left + window.pageXOffset - d.clientLeft;
		domParams.top = box.top + window.pageYOffset - d.clientTop;
		domParams.width = box.width;
		domParams.height = box.height;
		
		return domParams;
		
	},
	
	isDomPosChange: function( domParams ) {
		
		return this.domParams.left !== domParams.left ||
			this.domParams.top !== domParams.top;
		
	},
	
	isDomSizeChange: function( domParams ) {
		
		return this.domParams.width !== domParams.width ||
			this.domParams.height !== domParams.height;
		
	},
	
	/**
	 * onMouseMove(), abstract method.
	 *
	 * Override this function to add handler for mouse move event.
	 *
	 * @param event
	 */
	
	onMouseMove: function( event ) {
		
		// calculate mouse position.
		
		this.mouse.x = ( ( event.clientX - MouseCaptureHelper.getElementViewLeft( this.sceneArea ) ) / this.sceneArea.clientWidth ) * 2 - 1;
		this.mouse.y = - ( ( event.clientY - MouseCaptureHelper.getElementViewTop( this.sceneArea ) )  / this.sceneArea.clientHeight ) * 2 + 1;
		
		// Use Raycaster to capture hovered element.
		
		this.raycaster.setFromCamera( this.mouse, this.camera );
		let intersects = this.raycaster.intersectObjects( this.scene.children, true );
		
		this.handlers.handleHover( intersects );
		
	},
	
	/**
	 * onClick(), Handler for move click event.
	 *
	 * @param event
	 */
	
	onClick: function ( event ) {
		
		// Use Raycaster to capture clicked element.
		
		this.raycaster.setFromCamera( this.mouse, this.camera );
		let intersects = this.raycaster.intersectObjects( this.scene.children, true );
		
		for ( let i = 0; i < intersects.length; i ++ ) {
			
			if ( intersects !== null && intersects.length > 0 && intersects[ i ].object.type === "Mesh" ) {
				
				let selectedElement = intersects[ i ].object;
				
				if ( selectedElement.clickable === true ) {
					
					this.handlers.handleClick( selectedElement );
					
					break;
					
				}
				
			}
			
		}
		
	},

	VRInteractions: function (event) {
		const session = this.renderer.xr.getSession();
		let trigger_derecho = null;
		let trigger_izquierdo = null;
		let grip_derecho = null;
	
		if (session) {
	
			for (const source of session.inputSources) {
				if (!source.gamepad) continue;
				
				const data = {
					handedness: source.handedness,
					buttons: source.gamepad.buttons.map((b) => b.value),
					axes: source.gamepad.axes.slice(0)
				};

				// Bucle para saber que botones se estan pulsando
				for (let i = 0; i < data.buttons.length; i++) {
					if (data.buttons[i] === 1) {
						//console.log("boton " + i + " pulsado");
					}
				}

				// Iniciamos la configuración de los triggers
				if (data.handedness === "left") {
					trigger_izquierdo = data.buttons[0];

				}
				if (data.handedness === "right") {
					trigger_derecho = data.buttons[0];
					grip_derecho = data.buttons[1];
				}
				if (primer_inicio){
					//console.log("--------------------------Primer inicio--------------------------------")
					posicion_derecha = null;
					posicion_izquierda = null;
					posicion_derecha = new THREE.Vector3(this.renderer.xr.getController(1).position.x, this.renderer.xr.getController(1).position.y, this.renderer.xr.getController(1).position.z);
					posicion_izquierda = new THREE.Vector3(this.renderer.xr.getController(0).position.x, this.renderer.xr.getController(0).position.y, this.renderer.xr.getController(0).position.z);
					//console.log("Posición inicial del controlador derecho: " + posicion_derecha.x);
					//console.log("Posición inicial del controlador izquierdo: " + posicion_izquierda.x);
					primer_inicio = false;
				}
				
				if (trigger_derecho === 1 && trigger_izquierdo === 1) {
					//console.log("Ambos triggers pulsados");
					// Verificar si los controladores se han movido
					posicion_final_derecho = this.renderer.xr.getController(1).position;
					posicion_final_izquierdo = this.renderer.xr.getController(0).position;
					//console.log("Posicion inicial derecho vs final derecho: " + posicion_derecha.z + " vs " + posicion_final_derecho.z);
					//console.log("Posicion inicial izquierdo vs final izquierdo: " + posicion_izquierda.z + " vs " + posicion_final_izquierdo.z);
					if (posicion_derecha.z - posicion_final_derecho.z > desplazamiento && posicion_izquierda.z - posicion_final_izquierdo.z > desplazamiento) {
						// console.log("Alejamos al usuario");
						this.user.position.z -= mov;
					} else if (posicion_derecha.z - posicion_final_derecho.z < -desplazamiento && posicion_izquierda.z - posicion_final_izquierdo.z < -desplazamiento) {
						//console.log("Acerca al usuario");
						this.user.position.z += mov;
					} else if (posicion_derecha.y - posicion_final_derecho.y > desplazamiento && posicion_izquierda.y - posicion_final_izquierdo.y > desplazamiento) {
						//console.log("Subimos al usuario");
						this.user.position.y += mov;
					} else if (posicion_derecha.y - posicion_final_derecho.y < -desplazamiento && posicion_izquierda.y - posicion_final_izquierdo.y < -desplazamiento) {
						//console.log("Bajamos al usuario");
						this.user.position.y -= mov;
					} else if (posicion_derecha.x - posicion_final_derecho.x > desplazamiento && posicion_izquierda.x - posicion_final_izquierdo.x < -desplazamiento) {
						//console.log("Hacemos más pequeño al modelo");
						this.modelo.scale.x, this.modelo.scale.y -= zoom;
					} else if (posicion_derecha.x - posicion_final_derecho.x < -desplazamiento && posicion_izquierda.x - posicion_final_izquierdo.x > desplazamiento) {
						//console.log("Hacemos más grande al modelo");
						this.modelo.scale.x, this.modelo.scale.y += zoom;
					}

				} else if (grip_derecho === 1) {
					posicion_final_derecho = this.renderer.xr.getController(1).position;
					posicion_final_izquierdo = this.renderer.xr.getController(0).position;
					// console.log("Posición inicial derecho vs final derecho: " + posicion_derecha.x + " vs " + posicion_final_derecho.x);
					// console.log("Posición inicial izquierdo vs final izquierdo: " + posicion_izquierda.x + " vs " + posicion_final_izquierdo.x);
					if (posicion_derecha.x - posicion_final_derecho.x > umbral_rotacion || posicion_izquierda.x - posicion_final_izquierdo.x < -umbral_rotacion) {
						// el modelo rota sobre su eje Y
						this.modelo.rotation.y += rotacion;
						primer_inicio = true;
					} else if (posicion_derecha.x - posicion_final_derecho.x < -umbral_rotacion || posicion_izquierda.x - posicion_final_izquierdo.x > umbral_rotacion) {
						// el modelo rota sobre su eje Y
						this.modelo.rotation.y -= rotacion;
						primer_inicio = true;
					}
				} else if (trigger_derecho !== 1 && trigger_izquierdo !== 1 && grip_derecho !== 1) {
					//console.log("No se han pulsado ambos triggers");	
					primer_inicio = true;
				}
	
				// Control de movimientos
				if (data.axes[2] !== 0 || data.axes[3] !== 0) {
					//console.log(data.handedness === "right" ? "derecho" : "izquierdo");
					if (data.handedness === "left") {
						this.user.position.x += data.axes[2] * mov;
						this.user.position.y += data.axes[3] * -mov;
						//console.log("this.user.position: ", this.user.position);
					} else if (data.handedness === "right") {
						this.modelo.rotation.y += data.axes[2] * -mov;
						this.modelo.rotation.x += data.axes[3] * mov;
						//console.log("this.modelo.rotation: ", this.modelo.rotation);

						// this.user.rotation.y += data.axes[2] * -0.0001;
						// this.user.rotation.x += data.axes[3] * 0.0001;
						// console.log("this.user.rotation: ", this.user.rotation);
					}
	
				}

				// interseccion con raycaster desde el controlador
				this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
				const intersects = this.raycaster.intersectObjects([this.modelo], true);

				for (let i = 0; i < intersects.length; i++) {
					if (intersects.length > 0) {
						this.handlers.handleHover(intersects);
						if (data.buttons[4] === 1){
							if ( intersects !== null && intersects.length > 0 && intersects[ i ].object.type === "Mesh" ) {
								//console.log("tocando modelo", this.modelo)
								let selectedElement = intersects[ i ].object;
								if ( selectedElement.clickable === true ) {
									this.handlers.handleClick( selectedElement );
									break;
								}
							}
						}
					}	
				}
			}
			
		}
	},
	
} );

export { Web3DRenderer };