<template>
	<view>
		<web-view :webview-styles="webviewStyles" :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				webviewStyles: {
					progress: {
						color: '#5A2B81'
					}
				},
				url: ''
			}
		},
		onLoad(option) {
			this.url = decodeURIComponent(option.url) || ''
		}
	}
</script>

<style>
</style>
