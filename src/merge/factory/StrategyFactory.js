/**
 * @author syt123450 / https://github.com/syt123450
 */

import { Add3d } from "../strategy/Add3d.js";
import { Concatenate3d } from "../strategy/Concatenate3d.js";
import { Subtract3d } from "../strategy/Subtract3d.js";
import { Multiply3d } from "../strategy/Multiply3d.js";
import { Maximum3d } from "../strategy/Maximum3d.js";
import { Average3d }  from "../strategy/Average3d.js";
import { Add2d } from "../strategy/Add2d.js";
import { Subtract2d } from "../strategy/Subtract2d.js";
import { Maximum2d } from "../strategy/Maximum2d.js";
import { Average2d } from "../strategy/Average2d.js";
import { Multiply2d } from "../strategy/Multiply2d.js";
import { Concatenate2d } from "../strategy/Concatenate2d.js";
import { Add1d } from "../strategy/Add1d.js";
import { Subtract1d } from "../strategy/Subtract1d.js";
import { Maximum1d } from "../strategy/Maximum1d.js";
import { Average1d } from "../strategy/Average1d.js";
import { Multiply1d } from "../strategy/Multiply1d.js";
import { Concatenate1d } from "../strategy/Concatenate1d.js";

/**
 * "StrategyFactory" create a operation strategy for MergedLayer.
 * This Factory method is used by "MergedLayer1d", "MergedLayer2d", "MergedLayer3d".
 * As merge function in TensorSpace use Strategy design pattern,
 * this Factory method handle creation of all concretion strategies.
 */

let StrategyFactory = ( function() {

	function getOperationStrategy( operator, dimension, mergedElements ) {

		if ( dimension === 3 ) {

			if ( operator === "add" ) {

				return new Add3d( mergedElements );

			} else if ( operator === "concatenate" ) {

				return new Concatenate3d( mergedElements );

			} else if ( operator === "subtract" ) {

				return new Subtract3d( mergedElements );

			} else if ( operator === "multiply" ) {

				return new Multiply3d( mergedElements );

			} else if ( operator === "dot" ) {

				// TODO, implement dot3d operation, different visualization effects with other 3d operation

			} else if ( operator === "maximum" ) {

				return new Maximum3d( mergedElements );

			} else if ( operator === "average" ) {

				return new Average3d( mergedElements );

			}

		} else if ( dimension === 2 ) {

			if ( operator === "add" ) {

				return new Add2d( mergedElements );

			} else if ( operator === "concatenate" ) {

				return new Concatenate2d( mergedElements );

			} else if ( operator === "subtract" ) {

				return new Subtract2d( mergedElements );

			} else if ( operator === "multiply" ) {

				return new Multiply2d( mergedElements );

			} else if ( operator === "dot" ) {

				// TODO, implement dot2d operation, different visualization effects with other 2d operation

			} else if ( operator === "maximum" ) {

				return new Maximum2d( mergedElements );

			} else if ( operator === "average" ) {

				return new Average2d( mergedElements );

			}

		} else if ( dimension === 1 ) {

			if ( operator === "add" ) {

				return new Add1d( mergedElements );

			} else if ( operator === "concatenate" ) {

				return new Concatenate1d( mergedElements );

			} else if ( operator === "subtract" ) {

				return new Subtract1d( mergedElements );

			} else if ( operator === "multiply" ) {

				return new Multiply1d( mergedElements );

			} else if ( operator === "dot" ) {

				// TODO, implement dot1d operation, different visualization effects with other 1d operation

			} else if ( operator === "maximum" ) {

				return new Maximum1d( mergedElements );

			} else if ( operator === "average" ) {

				return new Average1d( mergedElements );

			}

		}

	}

	return {

		getOperationStrategy: getOperationStrategy

	}

} )();

export { StrategyFactory };