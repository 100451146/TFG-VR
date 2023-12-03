/**
 * @author syt123450 / https://github.com/syt123450
 */

import { CloseData } from "../assets/image/CloseData.js";
import { PlusData } from "../assets/image/Plus.js";
import { ConcatenateData } from "../assets/image/Concatenate.js";
import { SubtractData } from "../assets/image/Subtract.js";
import { MultiplyData } from "../assets/image/Multiply.js";
import { MaximumData } from "../assets/image/Maximum.js";
import { AverageData } from "../assets/image/Average.js";
import { DotData } from "../assets/image/Dot.js";
import { NextData } from "../assets/image/Next.js";
import { LastData } from "../assets/image/Last.js";

let TextureProvider = ( function() {

	function getTexture( name ) {

		if ( name === "close" ) {

			return CloseData;

		} else if ( name === "add" ) {

			return PlusData;

		} else if ( name === "concatenate" ) {

			return ConcatenateData;

		} else if ( name === "subtract" ) {

			return SubtractData;

		} else if ( name === "multiply" ) {

			return MultiplyData;

		} else if ( name === "maximum" ) {

			return MaximumData;

		} else if ( name === "average" ) {

			return AverageData;

		} else if ( name === "dot" ) {

			return DotData;

		} else if ( name === "next" ) {

			return NextData;

		} else if ( name === "last" ) {

			return LastData;

		}

	}

	return {

		getTexture: getTexture

	}

} )();

export { TextureProvider };