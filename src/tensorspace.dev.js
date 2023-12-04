/*
 * @author syt123450 / https://github.com/syt123450
 */

import { VRButton } from '../examples/lib/VRButton.js';

import { Sequential } from './tsp-model/Sequential.js';
import { Model } from './tsp-model/Model.js';
import { Conv1d } from './layer/intermediate/Conv1d.js';
import { Conv2d } from './layer/intermediate/Conv2d.js';
import { Conv2dTranspose } from './layer/intermediate/Conv2dTranspose.js';
import { DepthwiseConv2d } from './layer/intermediate/DepthwiseConv2d.js';
import { Cropping1d } from './layer/intermediate/Cropping1d.js';
import { Cropping2d } from './layer/intermediate/Cropping2d.js';
import { Input1d } from './layer/input/Input1d.js';
import { GreyscaleInput } from './layer/input/GreyscaleInput.js';
import { RGBInput } from './layer/input/RGBInput.js';
import { Output1d } from './layer/output/Output1d.js';
import { OutputDetection } from './layer/output/OutputDetection.js';
import { YoloGrid } from './layer/output/YoloGrid.js';
import { Flatten } from './layer/intermediate/Flatten.js';
import { Pooling1d } from './layer/intermediate/Pooling1d.js';
import { Pooling2d } from './layer/intermediate/Pooling2d.js';
import { Reshape } from './layer/intermediate/Reshape.js';
import { Dense } from './layer/intermediate/Dense.js';
import { Padding1d } from './layer/intermediate/Padding1d.js';
import { Padding2d } from './layer/intermediate/Padding2d.js';
import { UpSampling1d } from './layer/intermediate/UpSampling1d.js';
import { UpSampling2d } from './layer/intermediate/UpSampling2d.js';
import { GlobalPooling1d } from './layer/intermediate/GlobalPooling1d.js';
import { GlobalPooling2d } from './layer/intermediate/GlobalPooling2d.js';
import { BasicLayer1d } from './layer/intermediate/BasicLayer1d.js';
import { BasicLayer2d } from './layer/intermediate/BasicLayer2d.js';
import { BasicLayer3d } from './layer/intermediate/BasicLayer3d.js';
import { Activation1d } from './layer/intermediate/Activation1d.js';
import { Activation2d } from './layer/intermediate/Activation2d.js';
import { Activation3d } from './layer/intermediate/Activation3d.js';

import { Add } from './merge/Add.js';
import { Concatenate } from './merge/Concatenate.js';
import { Subtract } from './merge/Subtract.js';
import { Maximum } from './merge/Maximum.js';
import { Average } from './merge/Average.js';
// import { Dot } from "./merge/Dot";
import { Multiply } from './merge/Multiply.js';

import { KerasLoader } from './loader/KerasLoader.js';
import { TfjsLoader } from './loader/TfjsLoader.js';
import { TfLoader } from './loader/TfLoader.js';
import { LiveLoader } from './loader/LiveLoader.js';

import { KerasPredictor } from './predictor/KerasPredictor.js';
import { TfjsPredictor } from './predictor/TfjsPredictor.js';
import { TfPredictor } from './predictor/TfPredictor.js';
import { LivePredictor } from './predictor/LivePredictor.js';

import { ModelConfiguration } from './configure/ModelConfiguration.js';

import { ActualDepthCalculator } from './utils/ActualDepthCalculator.js';
import { CenterLocator } from './utils/CenterLocator.js';
import { ChannelDataGenerator } from './utils/ChannelDataGenerator.js';
import { ColorUtils } from './utils/ColorUtils.js';
import { FmCenterGenerator } from './utils/FmCenterGenerator.js';
import { InLevelAligner } from './utils/InLevelAligner.js';
import { LayerLocator } from './utils/LayerLocator.js';
import { LayerStackGenerator } from './utils/LayerStackGenerator.js';
import { LevelStackGenerator } from './utils/LevelStackGenerator.js';
import { MathUtils } from './utils/MathUtils.js';
import { MergeValidator } from './utils/MergeValidator.js';
import { MouseCaptureHelper } from './utils/MouseCapturer.js';
import { OutputExtractor } from './utils/OutputExtractor.js';
import { OutputNeuralPosGenerator } from './utils/OutputNeuralPosGenerator.js';
import { QueueCenterGenerator } from './utils/QueueCenterGenerator.js';
import { RenderPreprocessor } from './utils/RenderPreprocessor.js';
import { TextHelper } from './utils/TextHelper.js';
import { TextureProvider } from './utils/TextureProvider.js';
import { YoloResultGenerator } from './utils/YoloResultGenerator.js';

import { version } from './version.js';

// Inicializar Three.js VR
VRButton.createButton();

let layers = {

	 Input1d: Input1d,
	 GreyscaleInput: GreyscaleInput,
	 RGBInput: RGBInput,
	 Output1d: Output1d,
	 OutputDetection: OutputDetection,
	 YoloGrid: YoloGrid,
	 Conv1d: Conv1d,
	 Conv2d: Conv2d,
	 Conv2dTranspose: Conv2dTranspose,
	 DepthwiseConv2d: DepthwiseConv2d,
	 Cropping1d: Cropping1d,
	 Cropping2d: Cropping2d,
	 Dense: Dense,
	 Flatten: Flatten,
	 Reshape: Reshape,
	 Pooling1d: Pooling1d,
	 Pooling2d: Pooling2d,
	 Padding1d: Padding1d,
	 Padding2d: Padding2d,
	 GlobalPooling1d: GlobalPooling1d,
	 GlobalPooling2d: GlobalPooling2d,
	 UpSampling1d: UpSampling1d,
	 UpSampling2d: UpSampling2d,
	 Layer1d: BasicLayer1d,
	 Layer2d: BasicLayer2d,
	 Layer3d: BasicLayer3d,
	 Activation1d: Activation1d,
	 Activation2d: Activation2d,
	 Activation3d: Activation3d,

	 Add: Add,
	 Concatenate: Concatenate,
	 Subtract: Subtract,
	 // Dot: Dot,
	 Multiply: Multiply,
	 Average: Average,
	 Maximum: Maximum

};

let models = {

	 Sequential: Sequential,
	 Model: Model

};

let loaders = {
	 KerasLoader: KerasLoader,
	 TfjsLoader: TfjsLoader,
	 TfLoader: TfLoader,
	 LiveLoader: LiveLoader
};

let predictors = {
	 KerasPredictor: KerasPredictor,
	 TfjsPredictor: TfjsPredictor,
	 TfPredictor: TfPredictor,
	 LivePredictor: LivePredictor
};

let utils = {
	 ActualDepthCalculator: ActualDepthCalculator,
	 CenterLocator: CenterLocator,
	 ChannelDataGenerator: ChannelDataGenerator,
	 ColorUtils: ColorUtils,
	 FmCenterGenerator: FmCenterGenerator,
	 InLevelAligner: InLevelAligner,
	 LayerLocator: LayerLocator,
	 LayerStackGenerator: LayerStackGenerator,
	 LevelStackGenerator: LevelStackGenerator,
	 MathUtils: MathUtils,
	 MergeValidator: MergeValidator,
	 MouseCaptureHelper: MouseCaptureHelper,
	 OutputExtractor: OutputExtractor,
	 OutputNeuralPosGenerator: OutputNeuralPosGenerator,
	 QueueCenterGenerator: QueueCenterGenerator,
	 RenderPreprocessor: RenderPreprocessor,
	 TextHelper: TextHelper,
	 TextureProvider: TextureProvider,
	 YoloResultGenerator: YoloResultGenerator
};

export { models, layers, loaders, predictors, utils, version, ModelConfiguration, VRButton };
