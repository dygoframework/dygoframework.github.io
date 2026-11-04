---
title: Test page
description: A fixed page for visual and accessibility tests. It never ships.
pagefind: false
---

This page stays the same so screenshot tests don't change when the synced docs change. It covers the parts a docs page uses.

## Text

A paragraph with **bold text**, `inline code` and a [link to the top](#text).

- A list item
- Another list item

## Code

```go title="main.go"
package main

import "fmt"

func main() {
	fmt.Println("hello")
}
```

```bash
go run .
```

## Table

| Name | Value |
|---|---|
| One | 1 |
| Two | 2 |
