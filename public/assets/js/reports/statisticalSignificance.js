var StatisticalSignificance = (function() {
	function getModel(originalSessions, variantSessions, originalConversions, variantConversions) {
		var model = {};

		model.n1 = originalSessions;
		model.n2 = variantSessions;
		model.x1 = originalConversions;
		model.x2 = variantConversions;

		// Calculate proportions.
		model.p1 = originalConversions / originalSessions;
		model.p2 = variantConversions / variantSessions;

		// Calculate q-values used in Normality test
		model.q1 = 1 - model.p1;
		model.q2 = 1 - model.p2;

		model.pHat = ( model.x1 + model.x2 ) / ( model.n1 + model.n2 );
		model.qHat = 1 - model.pHat;

		return model;
	}

	function calculateZStatistic(model) {
		var numerator = model.p1 - model.p2,
			denominator = Math.sqrt(model.pHat * model.qHat * ( 1 / model.n1 + 1 / model.n2)),
			Z = numerator / denominator;

		return Z;
	}

	// Check for the assumption of normality.
	function checkNormality(model) {
		var isNormality = ((model.n1 * model.p1 > 5) || (model.n1 * model.q1) > 5 || (model.n2 * model.p2) > 5 || (model.n2 * model.q2) > 5);

		if (isNormality) {
			// Normality condition satisfied.
			return true;
		}

		return false;
	}

	// Test the hypothesis that difference in CTRs is significant.
	// Significance level is "alpha"
	function testHypothesis(model, alpha) {
		var isNormal, criticalValue, Z, confidenceStr,
			significanceConfig = {
				'success': 'The result is significant with',
				'error': 'The result is not significant',
				'incomplete': 'Normality condition not satisfied. Not enough data to conduct a test'
			},
			resultConfig = {
				'success': false,
				'incomplete': false,
				'str': ''
			};

		function getCriticalValue(alphaValue) {
			if (alphaValue === 0.20) {
				return 1.282;
			} else if (alphaValue === 0.10) {
				return 1.645;
			} else if (alphaValue === 0.05) {
				return 1.960;
			} else if (alphaValue === 0.01) {
				return 2.576;
			}

			// Invalid significance level
			return 0;
		}

		isNormal = checkNormality(model);

		if (isNormal) {
			criticalValue = getCriticalValue(alpha);
			confidenceStr = ' ' + ((1 - Number(alpha)) * 100) + '% confidence';
			Z = calculateZStatistic(model);

			if (( -criticalValue < Z ) && ( Z < criticalValue)) {
				// Differences between rates are not significant at the current alpha level.
				resultConfig.success = true;
				significanceConfig.success += confidenceStr;
				resultConfig.str = significanceConfig.success;
				return resultConfig;
			}

			// Differences between rates are significant.
			resultConfig.success = false;
			resultConfig.str = significanceConfig.error;
			return resultConfig;
		}

		resultConfig.success = false;
		resultConfig.incomplete = true;
		resultConfig.str = significanceConfig.incomplete;
		return resultConfig;
	}

	function doTestWithIterations(model, alphaArr) {
		var i, iterator, result;

		for (i = 0; i < alphaArr.length; i++) {
			iterator = Number(alphaArr[i]);
			result = testHypothesis(model, iterator);

			if (result.success) {
				break;
			}
		}

		return result;
	}

	function testSS(model, alpha) {
		var alphaArr = [0.05, 0.01, 0.10, 0.20],
			alphaValue = Number(alpha), alphaIndex,
			result = testHypothesis(model, alphaValue);

		if ((result.success && !result.incomplete) || (!result.success && result.incomplete)) {
			return result;
		}

		alphaIndex = alphaArr.indexOf(alphaValue);

		if (alphaIndex > -1) {
			alphaArr.splice(alphaIndex, 1);
			return doTestWithIterations(model, alphaArr);
		}

		return false;
	}

	return {
		getModel: getModel,
		test: testSS
	};
})();

window.SS = StatisticalSignificance;
