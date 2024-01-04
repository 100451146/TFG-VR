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
		
		this.renderer = new THREE.WebGLRenderer( {
			
			canvas: sceneArea,
			antialias: true
			
		} );

		document.body.appendChild(VRButton.createButton(this.renderer));
		this.renderer.xr.enabled = true;

		this.renderer.setAnimationLoop(() => {
			this.animate();
		});
		
		this.renderer.setSize( sceneArea.width, sceneArea.height );
		this.container.appendChild( this.renderer.domElement );
		
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( this.backgroundColor );
		// cambiamos escala del tspModel
		this.tspModel.modelContext.scale.set(0.01,0.01,0.01);
		this.scene.add( this.tspModel.modelContext );

		
		this.camera = new THREE.PerspectiveCamera();
		this.camera.fov = 45;
		this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
		this.camera.near = 0.1;
		this.camera.far = 10000;
		
		this.camera.updateProjectionMatrix();
		this.camera.name = 'defaultCamera';

		const light = new THREE.DirectionalLight( 0xffffff, 3 );
		light.position.set( 0, 0, 1 );
		this.scene.add( light );

		// controllers

		const handModels = {
			left: null,
			right: null
		};

		// definir this.tspModel.onMouseDown y this.tspModel.onMouseUp, pasando this.tspModel como parametro
		this.tspModel.onMouseDown = (controller) => {
			console.log("onMouseDown")
			console.log("controller: ", controller)
			// si es controller 1, reducimos escala, sino la aumentamos
			if (controller.name == "controller1") { // controller 1
				console.log("controller 1");
				this.tspModel.modelContext.scale.set(this.tspModel.modelContext.scale.x - 0.1, this.tspModel.modelContext.scale.y - 0.1, this.tspModel.modelContext.scale.z - 0.1);
			} else { // controller 2
				console.log("controller 2")
				this.tspModel.modelContext.scale.set(this.tspModel.modelContext.scale.x + 0.1, this.tspModel.modelContext.scale.y + 0.1, this.tspModel.modelContext.scale.z + 0.1);
			} 
		}

		// si this.tspModel.onMouseUp, simplemente dejamos de pulsar
		this.tspModel.onMouseUp = () => {
			console.log("onMouseUp")
		}

		const controller1 = this.renderer.xr.getController( 0 );
		controller1.name = 'controller1';
		console.log("tspModel: ", this.tspModel)
		controller1.addEventListener( 'selectstart', () => { this.tspModel.onMouseDown(controller1); } );
		controller1.addEventListener( 'selectend', () => { this.tspModel.onMouseUp(); } );
		this.scene.add( controller1 );

		const controller2 = this.renderer.xr.getController( 1 );
		controller2.name = 'controller2';
		controller2.addEventListener( 'selectstart', () => { this.tspModel.onMouseDown(controller2); } );
		controller2.addEventListener( 'selectend', () => { this.tspModel.onMouseUp(); } );
		this.scene.add( controller2 );
		

		const controllerModelFactory = new XRControllerModelFactory();
		const handModelFactory = new XRHandModelFactory();

		// Hand 1

		const controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
		controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
		this.scene.add( controllerGrip1 );

		
		const hand1 = this.renderer.xr.getHand( 0 );
		hand1.userData.currentHandModel = 0;
		this.scene.add( hand1 );

		handModels.left = [
			handModelFactory.createHandModel( hand1, 'boxes' ),
			handModelFactory.createHandModel( hand1, 'spheres' ),
			handModelFactory.createHandModel( hand1, 'mesh' )
		];

		for ( let i = 0; i < 3; i ++ ) {

			const model = handModels.left[ i ];
			model.visible = i == 0;
			hand1.add( model );

		}

		hand1.addEventListener( 'pinchend', function () {

			handModels.left[ this.userData.currentHandModel ].visible = false;
			this.userData.currentHandModel = ( this.userData.currentHandModel + 1 ) % 3;
			handModels.left[ this.userData.currentHandModel ].visible = true;

		} );

		// Hand 2
		const controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
		controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
		this.scene.add( controllerGrip2 );

		const hand2 = this.renderer.xr.getHand( 1 );
		hand2.userData.currentHandModel = 0;
		this.scene.add( hand2 );

		handModels.right = [
			handModelFactory.createHandModel( hand2, 'boxes' ),
			handModelFactory.createHandModel( hand2, 'spheres' ),
			handModelFactory.createHandModel( hand2, 'mesh' )
		];

		for ( let i = 0; i < 3; i ++ ) {

			const model = handModels.right[ i ];
			model.visible = i == 0;
			hand2.add( model );

		}

		hand2.addEventListener( 'pinchend', function () {

			handModels.right[ this.userData.currentHandModel ].visible = false;
			this.userData.currentHandModel = ( this.userData.currentHandModel + 1 ) % 3;
			handModels.right[ this.userData.currentHandModel ].visible = true;

		} );

		const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 5 ) ] );

		const line = new THREE.Line( geometry );
		line.name = 'line';
		line.scale.z = 5;

		controller1.add( line.clone() );
		controller2.add( line.clone() );
		
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
		
	}
	
} );

export { Web3DRenderer };