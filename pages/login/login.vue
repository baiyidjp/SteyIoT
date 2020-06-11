<template>
	<view class="login-container">
		<view class="input-container">
			<view class="code-container">
				<view class="code" @click="nationCodeClick">
					<uni-icons type="plusempty" size="12" color="#5B5B5B"></uni-icons>
					<text class="codeText">+ {{ nationCode }}</text>
				</view>
				<uni-icons type="arrowdown" color="#5B5B5B" size="10"></uni-icons>
				<view class="line"></view>
			</view>
			<input type="number" placeholder="请输入手机号" @input="mobileInput"/>
		</view>
		<view v-if="isLoginByPassword" >
			<view class="input-container">
				<input :password="true" placeholder="请输入密码" @input="passwordInput"/>
			</view>
		</view>
		<view v-else class="msg-code-container">
			<view class="input-container">
				<input type="number" placeholder="请输入验证码" @input="verificationCodeInput"/>
			</view>
			<view class="code-button" :class="{disabled: codeButtonDisabled}" @click="codeButtonClick">{{ codeButtonText }}</view>
		</view>
		<view class="change-login" @click="changeLoginClick">{{ changeLoginText }}</view>
		<view class="login-button" :class="{disabled: loginButtonDisabled}" @click="loginButtonClick">登录</view>
	</view>
</template>

<script>
	import { mapMutations } from 'vuex'
	export default {
		data() {
			return {
				nationCode: '86',
				mobile: '',
				password: '',
				verificationCode : '',
				codeButtonText: '发送',
				timer: null,
				seconds: 60,
				isTimeDown: false,
				isLoginByPassword: true,
				codeButtonDisabled: true,
				loginButtonDisabled: true,
				changeLoginText: '验证码登录'
			}
		},
		methods: {
			...mapMutations(['login']),
			changeLoginClick() {
				this.isLoginByPassword = !this.isLoginByPassword
				this.changeLoginText = this.isLoginByPassword ? '验证码登录' : '密码登录'
			},
			nationCodeClick() {
				uni.showToast({
					icon: 'none',
					title:'当前只支持中国手机号',
					duration:2000
				})
			},
			mobileInput(event) {
				// https://blog.csdn.net/weixin_43343144/article/details/101097177
				setTimeout(() => {
					const value = event.detail.value
					this.mobile = value
					if (this.nationCode == '86') {
						if (value.length == 11) {
							this.codeButtonDisabled = false
						} else {
							this.codeButtonDisabled = true
						}
					} else {
						if (value.length >= 4 && value.length <= 15) {
							this.codeButtonDisabled = false
						} else {
							this.codeButtonDisabled = true
						}
					}
					this.loginButtonAbled()
				}, 0)
			},
			passwordInput(event) {
				setTimeout(() => {
					this.password = event.detail.value
					this.loginButtonAbled()
				}, 0)
			},
			verificationCodeInput(event) {
				setTimeout(() => {
					this.verificationCode = event.detail.value
					this.loginButtonAbled()
				}, 0)
			},
			loginButtonAbled() {
				if (this.isLoginByPassword) {
					if (this.password.length >= 6 && this.password.length <= 18 && !this.codeButtonDisabled) {
						this.loginButtonDisabled = false
					} else {
						this.loginButtonDisabled = true
					}
				} else {
					if (this.verificationCode.length == 4 && !this.codeButtonDisabled) {
						this.loginButtonDisabled = false
					} else {
						this.loginButtonDisabled = true
					}
				}
			},
			codeButtonClick() {
				if (this.isTimeDown || this.codeButtonDisabled) {
					return;
				}
				uni.showLoading({
					title: '',
					mask: true
				})
				const param = {
					mobile: this.mobile,
					nationCode: this.nationCode,
					typeC: 'login'
				}
				uni.request({
					url: 'https://gateway.stey.com/stey-service/security/v2/vercode',
					method: 'POST',
					data: {
						data: param,
						timestamp: Date.now()
					},
					header: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					responseType: '',
					success: res => {
						if (res.statusCode == 200) {
							this.isTimeDown = true;
							this.countDown();
							this.timer = setInterval(() => {
								this.seconds--
								if (this.seconds <= 0) {
									clearInterval(this.timer)
									this.isTimeDown = false;
									this.codeButtonText = '发送'
									return
								}
								this.countDown()
							}, 1000)
						} else {
							const error = res.data.error
							if (error) {
								uni.showToast({
									icon: 'none',
									title: error,
									duration: 2000
								});
							}
						}
					},
					fail: () => {},
					complete: () => {
						uni.hideLoading()
					}
				});
			},
			countDown() {
				this.codeButtonText = this.seconds + ' s'
			},
			loginButtonClick() {
				uni.showLoading({
					title: '',
					mask: true
				});
				const providerId = this.isLoginByPassword ? 'mobile' : 'token'
				const passwordOrToken = this.isLoginByPassword ? this.password : this.verificationCode
				const param = {
					providerKey: `${this.nationCode}-${this.mobile}`,
					providerId,
					passwordOrToken,
					accessPortal: 'mobile_app'
				}
				uni.request({
					url: 'https://gateway.stey.com/auth-service/auth/login',
					method: 'POST',
					data: {
						data: param,
						timestamp: Date.now()
					},
					header: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					responseType: '',
					success: res => {
						console.log(res)
						if (res.statusCode == 200) {
							const token = res.data.data.accessToken
							uni.setStorageSync('token', token)
							uni.setStorageSync('haveLogin', true)
							// 提交
							this.login()
							uni.showToast({
								title: '登录成功',
								duration: 2000
							});
							uni.redirectTo({
								url: '../index/index'
							})()
						} else {
							const error = res.data.error
							if (error) {
								uni.showToast({
									icon: 'none',
									title: error,
									duration: 2000
								});
							}
						}
					},
					fail: () => {},
					complete: () => {
						uni.hideLoading()
					}
				});
			}
		},
		beforeDestroy() {
			clearInterval(this.timer)
		}
	}
</script>

<style lang="scss">
	.login-container {
		padding: 40rpx;
	}
	.input-container {
		display: flex;
		align-items: center;
		background-color: rgba(216, 216, 216, 0.5);
		height: 80rpx;
		border-radius: 8rpx;
		margin-bottom: 32rpx;
		flex-grow: 1;
	}
	.input-container input {
		padding-left: 32rpx;
	}
	.code-container {
		display: flex;
		justify-content: space-between;
		width: 168rpx;
	}
	.code {
		display: flex;
		font-size: 16px;
		color: #5B5B5B;
		margin-left: 32rpx;
	}
	.codeText {
		padding-left: 4rpx;
		padding-top: 2rpx;
	}
	.line {
		background-color: #ADADAD;
		width: 1px;
		height: 50rpx;
	}
	.msg-code-container {
		display: flex;
	}
	.code-button {
		background-color: $uni-color-stey;
		width: 90px;
		height: 80rpx;
		line-height: 80rpx;
		flex-shrink: 1;
		margin-left: 20rpx;
		border-radius: 8rpx;
		font-size: 14px;
		color: #FFFFFF;
		text-align: center;
	}
	.change-login {
		font-size: 14px;
		color: #5B5B5B;
	}
	.login-button {
		background-color: $uni-color-stey;
		height: 80rpx;
		line-height: 80rpx;
		flex-shrink: 1;
		border-radius: 8rpx;
		font-size: 14px;
		color: #FFFFFF;
		text-align: center;
		margin-top: 106rpx;
	}
	.disabled {
		background-color: $uni-color-stey-disabled;
	}
</style>
