<template>
    <div class="range-input"
        :class="{'disabled': disabled}"
        :style="styleName"
        @mouseover="handleMouseover"
        @mouseout="handleMouseout">
        <div class="range-input-box"
            :class="{'active': rangeInputFocus, 'error': svgType == 'error'}">
            <div class="input-box">
                <input type="text"
                    class="range-input"
                    :disabled="disabled"
                    :placeholder="placeholder"
                    v-model="rangeInputs[0]"
                    @input="handleInput"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange">
            </div>
            <div class="range-input-divider"></div>
            <div class="input-box">
                <input type="text"
                    class="range-input"
                    :disabled="disabled"
                    :placeholder="placeholder"
                    v-model="rangeInputs[1]"
                    @input="handleInput"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange">
            </div>
            <svg class="svgClass"
                @click="svgType == 'del' && handleClear()"></svg>
        </div>
    </div>
</template>
<script>
export default {
    name: 'RangeInput',
    props: {
        type: { // 类型 便于表单验证 区间是只能输入钱数 还是整数等
            type: String,
            default:'input'
        },
        width: { // 组件的宽度
            type: String,
            default: '256px'
        },
        placeholder: { // 输入框占位文本
            type: String,
            default: ''
        },
        value: { // 绑定值
            type: Array,
            default: []
        },
        clearable: { // 是否支持清空
            type: Boolean,
            default: false
        },
        disabled: { // 是否禁用
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            svgClass: '',
            rangeInputFocus: false,
            rangeInputs: [...this.value],
            svgType: this.type,
            validateState: true, // 表单验证结果
            errorMessage: '',
        }
    },
    computed: {
        styleName () {
            return {
                width: this.width
            }
        },
        svgName () {
            return this.svgType == 'money' ? '#svg_sales' : 
                   this.svgType == 'del' ? '#svg_close' : '#svg_draw'
        }
    },
    methods: {
        handleInput () {
            this.$emit('input', [...this.rangeInputs]);
        },
        handleFocus (event) {
            this.rangeInputFocus = true;
            this.$emit('focus', event);
        },
        handleBlur (event) {
            this.rangeInputFocus = false;
            this.$emit('blur', event);
        },
        handleChange () {
            this.$emit('change', [...this.rangeInputs]);
        },
        hanleMouseover () {
            if (!this.validateState) {
                this.svgType = 'error';
            } else {
                this.rangeInputs && this.rangeInputs.length && this.clearable ? this.svgType = 'del' : this.svgType = this.type;
            }
        },
        handleMouseout () {
            if (!this.validateState) {
                this.svgType = 'error';
            } else {
                this.svgType = this.type;
            }
        },
        handleClear () {
            this.rangeInputs = ['', ''];
            this.$emit('input', null);
        }
    }
};
</script>
<style lang="scss" scoped>
%highlight {  // scss  声明样式  其他地方继承（@extend）
    position: absolute;
    bottom: 0;
    left: 0;
    content: '';
    width: 100%;
    height: 1px;
}
.range-input{
    padding: 4px 0;
    .range-input-box{
        position: relative;
        display: flex;
        align-items: center;
        height: 32px;
        line-height: 32px;
        border-radius: 8px;
        background: $c129;
        overflow: hidden;
        &.active:after{
            @extend %hightlight;
            background: $a001;
        }
        &.error:after{
            @extend %hightlight;
            background: $c001;
        }
        .input-box{
            width: calc((100% - 6px - 18px -6px) / 2);
            .range-input{
                width: 100%;
                padding: 0 6px 0 8px;
                @include body1;
                height: 32px;
                line-height: 32px;
                box-sizing: border-box;
                background: transparent;
                color: $c121;
                &::-webkit-input-placeholder{
                    color: $c125;
                }
                &::-moz-placeholder{
                    color: $c125;
                }
            }
        }
        .range-input-divider{
            content: '';
            width: 6px;
            height: 1px;
            background: $c126;
        }
    }
    &:hover{
        .range-input-box{
            background: $c128;
        }
    }
    &.disabled{
        .range-input-box{
            cursor: not-allowed;
            background: $c130;
        }
    }
}
</style>