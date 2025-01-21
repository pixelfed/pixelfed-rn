import type { PropsWithChildren } from 'react'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import type { StyleProp, TextStyle } from 'react-native'

export type ReadMoreProps = {
  numberOfLines: number
  textStyle?: StyleProp<TextStyle>
  onReady?: () => void
  renderTruncatedFooter?: (toggleShowAllText: () => void) => void
  renderRevealedFooter?: (toggleShowAllText: () => void) => void
}

export default class ReadMore extends React.Component<PropsWithChildren<ReadMoreProps>> {
  state = {
    measured: false,
    shouldShowReadMore: false,
    showAllText: false,
  }
  protected isReadMoreMounted = false
  protected text: Text | null = null

  async componentDidMount() {
    this.isReadMoreMounted = true
    await nextFrameAsync()

    if (!this.isReadMoreMounted) {
      return
    }

    if (!this.text) {
      throw new Error('_text is not defined')
    }

    // Get the height of the text with no restriction on number of lines
    const fullHeight = await measureHeightAsync(this.text)
    this.setState({ measured: true })
    await nextFrameAsync()

    if (!this.isReadMoreMounted) {
      return
    }

    const limitedHeight = await measureHeightAsync(this.text)

    if (fullHeight > limitedHeight) {
      this.setState({ shouldShowReadMore: true }, () => {
        this.props.onReady && this.props.onReady()
      })
    } else {
      this.props.onReady && this.props.onReady()
    }
  }

  componentWillUnmount() {
    this.isReadMoreMounted = false
  }

  render() {
    let { measured, showAllText } = this.state

    let { numberOfLines } = this.props

    return (
      <View>
        <>
          <Text
            numberOfLines={measured && !showAllText ? numberOfLines : 0}
            style={this.props.textStyle}
            ref={(text) => {
              this.text = text
            }}
          >
            {this.props.children}
          </Text>

          {this._maybeRenderReadMore()}
        </>
      </View>
    )
  }

  _handlePressReadMore = () => {
    this.setState({ showAllText: true })
  }

  _handlePressReadLess = () => {
    this.setState({ showAllText: false })
  }

  _maybeRenderReadMore() {
    let { shouldShowReadMore, showAllText } = this.state

    if (shouldShowReadMore && !showAllText) {
      if (this.props.renderTruncatedFooter) {
        return this.props.renderTruncatedFooter(this._handlePressReadMore)
      }

      return (
        <Text style={styles.button} onPress={this._handlePressReadMore}>
          Read more
        </Text>
      )
    }

    if (shouldShowReadMore && showAllText) {
      if (this.props.renderRevealedFooter) {
        return this.props.renderRevealedFooter(this._handlePressReadLess)
      }

      return (
        <Text style={styles.button} onPress={this._handlePressReadLess}>
          Hide
        </Text>
      )
    }
  }
}

function measureHeightAsync(component: Text): Promise<number> {
  return new Promise((resolve) => {
    component.measure((x, y, w, h) => {
      resolve(h)
    })
  })
}

function nextFrameAsync(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

const styles = StyleSheet.create({
  button: {
    color: '#888',
    marginVertical: 5,
  },
})
