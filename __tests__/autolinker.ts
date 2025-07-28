import { type Part, getTextParts, parseText } from "src/components/common/AutolinkText"

function parse(text: string): Part[] {
  const matches = parseText(text)
  return getTextParts(text, matches)
}

describe('Autolinker', () => {

  test("parse mention (without explicit homeserver)", () => {
    // TODO: we need to check wether we want to parse this,
    // because it is problematic, when multiple different homeservers are involved
    expect(parse("@pixelfed"))
      .toStrictEqual([{ type: 'text', value: "@pixelfed" }] satisfies Part[])
    expect(parse("@pixelfed is cool"))
      .toStrictEqual([{ type: 'text', value: "@pixelfed is cool" }] satisfies Part[])
  })

  test("parse mention (with homeserver)", () => {
    expect(parse("@pixelfed@pixelfed.social"))
      .toStrictEqual([{ type: 'mention', value: "@pixelfed@pixelfed.social" }] satisfies Part[])
    expect(parse("@pixelfed@pixelfed.social is cool"))
      .toStrictEqual([{ type: 'mention', value: "@pixelfed@pixelfed.social" }, { type: 'text', 'value': " is cool" }] satisfies Part[])
  })

  test("parse hashtag", () => {
    expect(parse("#pixelfed"))
      .toStrictEqual([{ type: 'hashtag', value: "#pixelfed" }] satisfies Part[])
    expect(parse("#pixelfed is awesome"))
      .toStrictEqual([{ type: 'hashtag', value: "#pixelfed" }, { type: 'text', "value": " is awesome" }] satisfies Part[])
  })

  test("parse link", () => {
    expect(parse("http://pixelfed.org"))
      .toStrictEqual([{ type: 'link', value: "http://pixelfed.org" }] satisfies Part[])

    expect(parse("https://pixelfed.org"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org" }] satisfies Part[])
    expect(parse("Learn more about it at https://pixelfed.org"))
      .toStrictEqual([{ type: 'text', "value": "Learn more about it at " }, { type: 'link', value: "https://pixelfed.org" }] satisfies Part[])
  })

  test("parse link with path", () => {
    expect(parse("https://pixelfed.org/imaginary/index.html"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org/imaginary/index.html" }] satisfies Part[])
  })

  test("parse link with @ sign", () => {
    expect(parse("https://pixelfed.org/@user"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org/@user" }] satisfies Part[])
  })

  test("parse link with #fragment", () => {
    expect(parse("https://pixelfed.org#help"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org#help" }] satisfies Part[])
    expect(parse("https://pixelfed.org/#help"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org/#help" }] satisfies Part[])
    expect(parse("https://pixelfed.org/docs/#help"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org/docs/#help" }] satisfies Part[])
  })

  test("parse link with ?query", () => {
    expect(parse("https://pixelfed.org?q=test"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org?q=test" }] satisfies Part[])
    expect(parse("https://pixelfed.org/?q=test"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org/?q=test" }] satisfies Part[])
    expect(parse("https://pixelfed.org/search/?q=test"))
      .toStrictEqual([{ type: 'link', value: "https://pixelfed.org/search/?q=test" }] satisfies Part[])
  })
})
