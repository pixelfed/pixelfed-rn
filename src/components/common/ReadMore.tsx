import React, { type ReactNode } from 'react'
import { type LayoutChangeEvent, StyleSheet, Text, View, type Insets } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'

const styles = StyleSheet.create({
  fullTextWrapper: {
    opacity: 0,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  viewMoreText: {
    color: 'gray',
    fontWeight: 'bold',
    paddingVertical: 3,
  },
  transparent: {
    opacity: 0,
  },
})

const moreButtonHitSlop: Insets = { left: 15, right: 15, top: 6, bottom: 7 }

interface ReadMoreProps {
  numberOfLines: number
  children: ReactNode
}

// PROPS: numberOfLines, childre
class ReadMore extends React.Component<ReadMoreProps> {
  trimmedTextHeight: number | null = null
  fullTextHeight: number | null = null
  shouldShowMore = false

  state = {
    isFullTextShown: true,
    numberOfLines: this.props.numberOfLines,
  }

  hideFullText = () => {
    if (this.state.isFullTextShown && this.trimmedTextHeight && this.fullTextHeight) {
      this.shouldShowMore = this.trimmedTextHeight < this.fullTextHeight
      this.setState({
        isFullTextShown: false,
      })
    }
  }

  onLayoutTrimmedText = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout

    this.trimmedTextHeight = height
    this.hideFullText()
  }

  onLayoutFullText = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout

    this.fullTextHeight = height
    this.hideFullText()
  }

  onPressMore = () => {
    this.setState({
      numberOfLines: null,
    })
  }

  onPressLess = () => {
    this.setState({
      numberOfLines: this.props.numberOfLines,
    })
  }

  getWrapperStyle = () => {
    if (this.state.isFullTextShown) {
      return styles.transparent
    }
    return {}
  }

  renderViewMore = () => (
    <View style={{ flexDirection: 'row' }}>
      <PressableOpacity onPress={this.onPressMore} hitSlop={moreButtonHitSlop}>
        <Text style={styles.viewMoreText}>View More</Text>
      </PressableOpacity>
    </View>
  )

  renderViewLess = () => (
    <View style={{ flexDirection: 'row' }}>
      <PressableOpacity onPress={this.onPressLess} hitSlop={moreButtonHitSlop}>
        <Text style={styles.viewMoreText}>View Less</Text>
      </PressableOpacity>
    </View>
  )

  renderFooter = () => {
    const { numberOfLines } = this.state

    if (this.shouldShowMore === true) {
      if (numberOfLines > 0) {
        return this.renderViewMore()
      }
      return this.renderViewLess()
    }
    return null
  }

  renderFullText = () => {
    if (this.state.isFullTextShown) {
      return (
        <View onLayout={this.onLayoutFullText} style={styles.fullTextWrapper}>
          {this.props.children}
        </View>
      )
    }
    return null
  }

  render() {
    return (
      <View style={this.getWrapperStyle()}>
        <View onLayout={this.onLayoutTrimmedText}>
          <Text numberOfLines={this.state.numberOfLines}>{this.props.children}</Text>
          {this.renderFooter()}
        </View>

        {this.renderFullText()}
      </View>
    )
  }
}

export default ReadMore
