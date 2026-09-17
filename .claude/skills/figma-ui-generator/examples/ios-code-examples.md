## iOS

### SwiftUI — Token Files


#### AppColors.swift


```swift
// AppColors.swift
import SwiftUI

struct AppColors {
    static let primary        = Color(hex: "#002953")
    static let accent         = Color(hex: "#FF6700")
    static let textPrimary    = Color(hex: "#1A1A1A")
    static let textSecondary  = Color(hex: "#666666")
    static let textHint       = Color(hex: "#999999")
    static let border         = Color(hex: "#999999")
    static let borderFocus    = Color(hex: "#002953")
    static let surface        = Color.white
    static let background     = Color(hex: "#F5F5F5")
    static let divider        = Color(hex: "#E0E0E0")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB,
                  red:     Double(r) / 255,
                  green:   Double(g) / 255,
                  blue:    Double(b) / 255,
                  opacity: Double(a) / 255)
    }
}
```


#### AppTypography.swift


```swift
// AppTypography.swift
import SwiftUI

struct AppTypography {
    private static let fontFamily = "Rubik" // register in Info.plist under UIAppFonts

    // IMPORTANT: always chain .weight() so the system-font fallback uses the correct weight
    static func title()      -> Font { Font.custom("\(fontFamily)-Medium",  size: 18).weight(.medium) }
    static func label()      -> Font { Font.custom("\(fontFamily)-Medium",  size: 14).weight(.medium) }
    static func body1()      -> Font { Font.custom("\(fontFamily)-Regular", size: 14).weight(.regular) }
    static func caption()    -> Font { Font.custom("\(fontFamily)-Regular", size: 12).weight(.regular) }
    static func buttonLabel()-> Font { Font.custom("\(fontFamily)-Medium",  size: 14).weight(.medium) }

    // Line spacings: Figma lineHeight − fontSize
    static let body1LineSpacing:   CGFloat = 6   // lineHeight 20 − size 14
    static let captionLineSpacing: CGFloat = 4   // lineHeight 16 − size 12
}
```


#### AppSpacing / AppRadius / AppShadows


```swift
// AppSpacing.swift — extract every spacing value directly from Figma
struct AppSpacing {
    static let xs: CGFloat = 4;  static let sm: CGFloat = 8
    static let md: CGFloat = 12; static let lg: CGFloat = 16
    static let xl: CGFloat = 20; static let xxl: CGFloat = 24
    static let screenHorizontal: CGFloat = 16
    static let fieldHeight: CGFloat = 47
    static let buttonHeight: CGFloat = 40
}

// AppRadius.swift
struct AppRadius {
    static let input:  CGFloat = 4;  static let chip:   CGFloat = 8
    static let button: CGFloat = 82; static let card:   CGFloat = 12
}

// AppShadows.swift
struct AppShadows {
    struct Card {
        static let color: Color = Color.black.opacity(0.10)
        static let radius: CGFloat = 8; static let x: CGFloat = 0; static let y: CGFloat = 2
    }
}
```



#### AppTypography.swift — Variable Font Pattern

```swift
// AppTypography.swift — variable font pattern
struct AppTypography {
    // PostScript name from font's name table (nameID 6) — NOT the filename
    private static let upright = "Rubik-Light"         // covers all weights via wght axis
    private static let italic  = "Rubik-LightItalic"   // italic axis

    static func title()       -> Font { Font.custom(upright, size: 18).weight(.medium) }
    static func label()       -> Font { Font.custom(upright, size: 14).weight(.medium) }
    static func body1()       -> Font { Font.custom(upright, size: 14).weight(.regular) }
    static func caption()     -> Font { Font.custom(upright, size: 12).weight(.regular) }
    static func bodyItalic()  -> Font { Font.custom(italic,  size: 14).weight(.regular) }
    static func buttonLabel() -> Font { Font.custom(upright, size: 14).weight(.medium) }
}
```

### UIKit — Token Files


#### AppColors.swift — UIKit Color Token File


```swift
// AppColors.swift (UIKit)
import UIKit

struct AppColors {
    static let primary        = UIColor(hex: "#002953")
    static let accent         = UIColor(hex: "#FF6700")
    static let textPrimary    = UIColor(hex: "#1A1A1A")
    static let textSecondary  = UIColor(hex: "#666666")
    static let textHint       = UIColor(hex: "#999999")
    static let border         = UIColor(hex: "#999999")
    static let borderFocus    = UIColor(hex: "#002953")
    static let surface        = UIColor.white
    static let background     = UIColor(hex: "#F5F5F5")
}

extension UIColor {
    convenience init(hex: String) {
        let hex = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(red: CGFloat(r)/255, green: CGFloat(g)/255,
                  blue: CGFloat(b)/255, alpha: CGFloat(a)/255)
    }
}

// AppTypography.swift (UIKit)
import UIKit

struct AppTypography {
    private static let fontFamily = "Rubik"
    static func title()      -> UIFont { UIFont(name: "\(fontFamily)-Medium",  size: 18) ?? .systemFont(ofSize: 18, weight: .medium) }
    static func label()      -> UIFont { UIFont(name: "\(fontFamily)-Medium",  size: 14) ?? .systemFont(ofSize: 14, weight: .medium) }
    static func body1()      -> UIFont { UIFont(name: "\(fontFamily)-Regular", size: 14) ?? .systemFont(ofSize: 14, weight: .regular) }
    static func caption()    -> UIFont { UIFont(name: "\(fontFamily)-Regular", size: 12) ?? .systemFont(ofSize: 12, weight: .regular) }
    static func buttonLabel()-> UIFont { UIFont(name: "\(fontFamily)-Medium",  size: 14) ?? .systemFont(ofSize: 14, weight: .medium) }

    static let body1LineHeight:   CGFloat = 20
    static let captionLineHeight: CGFloat = 16
}

// AppShadows.swift (UIKit)
import UIKit
struct AppShadows {
    static func applyCard(to layer: CALayer) {
        layer.shadowColor   = UIColor.black.withAlphaComponent(0.10).cgColor
        layer.shadowOpacity = 1; layer.shadowRadius = 8
        layer.shadowOffset  = CGSize(width: 0, height: 2)
        layer.masksToBounds = false
    }
    static func applyBottomBar(to layer: CALayer) {
        layer.shadowColor   = UIColor.black.withAlphaComponent(0.20).cgColor
        layer.shadowOpacity = 1; layer.shadowRadius = 5
        layer.shadowOffset  = .zero; layer.masksToBounds = false
    }
}
```

### UIKit — XIB Template


```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.XIB" version="3.0"
          toolsVersion="13142" targetRuntime="iOS.CocoaTouch"
          propertyAccessControl="none" useAutolayout="YES"
          useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES">
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="12042"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <objects>
        <placeholder placeholderIdentifier="IBFilesOwner" id="-1"
                     userLabel="File's Owner"
                     customClass="<ComponentName>ViewController"
                     customModuleProvider="target">
            <connections>
                <outlet property="view" destination="i5M-Pr-FkT" id="sfx-zR-JGt"/>
            </connections>
        </placeholder>
        <placeholder placeholderIdentifier="IBFirstResponder" id="-2" customClass="UIResponder"/>
        <view clearsContextBeforeDrawing="NO" contentMode="scaleToFill" id="i5M-Pr-FkT">
            <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
            <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
            <color key="backgroundColor" systemColor="systemBackgroundColor"
                   cocoaTouchSystemColor="whiteColor"/>
            <viewLayoutGuide key="safeArea" id="fnl-2z-Ty3"/>
        </view>
    </objects>
</document>
```



