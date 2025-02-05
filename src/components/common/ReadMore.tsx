import React, { type ReactNode } from 'react'
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  fullTextWrapper: {
    opacity: 0,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  viewMoreText: {
    color: 'gray',
  },
  transparent: {
    opacity: 0,
  },
})

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
    <Text style={styles.viewMoreText} onPress={this.onPressMore}>
      View More
    </Text>
  )

  renderViewLess = () => (
    <Text style={styles.viewMoreText} onPress={this.onPressLess}>
      View Less
    </Text>
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
