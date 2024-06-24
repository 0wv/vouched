import moment from 'moment'
import { FilterQuery, Model } from 'mongoose'

export async function findPercentageDifference(days: number, model: Model<any>, compareKey: string, filter?: FilterQuery<any>) {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const firstDateCount = await model.countDocuments({
		...filter,
		[compareKey]: {
			$gte: today
		}
	})

	const secondDateCount = await model.countDocuments({
		...filter,
		[compareKey]: {
			$gte: new Date(today.getTime() - (days * 24 * 60 * 60 * 1000)),
			$lte: today
		}
	})

	const difference = firstDateCount - secondDateCount

	return {
		difference,
		percentage: (difference / (secondDateCount || 1)) * 100
	}
}

export async function getChartData(timeSpan: string, model: Model<any>, compareKey: string, filter: FilterQuery<any>) {
	const rawData = await model.aggregate([
		{
			$match: {
				...filter,
				[compareKey]: {
					$gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * parseInt(timeSpan))
				}
				// expiresAt: {
				//   $gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
				// }
			}
		},
		{
			$group: {
				_id: {
					$dateToString: {
						format: '%m-%d',
						date: `$${compareKey}`
					}
				},
				count: {
					$sum: 1
				}
			}
		},
		{
			$sort: {
				_id: 1
			}
		}
	])

	const labels = []
	const data = []

	for (let i = parseInt(timeSpan); i >= 0; i--) {
		const date = moment().subtract(i, 'days').format('MM-DD')
		const vouches = rawData.find(item => item._id === date)

		labels.push(date)
		data.push(vouches ? vouches.count : 0)
	}

	return {
		labels,
		data
	}
}