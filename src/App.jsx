// If you're using Next.js 13+ with app router, ensure the component is client-side:
// "use client"

import React, { useState } from "react";
import {
  Container,
  Box,
  Heading,
  Text,
  Input,
  Image,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Grid,
  GridItem,
  VStack,
  useToast,
} from "@chakra-ui/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

//
// 1. ICON SIZE DEFINITIONS
//
const ICON_SIZES = [
  // ------------------ iOS sizes ------------------
  { size: "20x20", idiom: "iphone", scale: "2x" },
  { size: "20x20", idiom: "iphone", scale: "3x" },
  { size: "29x29", idiom: "iphone", scale: "1x" },
  { size: "29x29", idiom: "iphone", scale: "2x" },
  { size: "29x29", idiom: "iphone", scale: "3x" },
  { size: "40x40", idiom: "iphone", scale: "2x" },
  { size: "40x40", idiom: "iphone", scale: "3x" },
  { size: "60x60", idiom: "iphone", scale: "2x" },
  { size: "60x60", idiom: "iphone", scale: "3x" },
  { size: "20x20", idiom: "ipad", scale: "1x" },
  { size: "20x20", idiom: "ipad", scale: "2x" },
  { size: "29x29", idiom: "ipad", scale: "1x" },
  { size: "29x29", idiom: "ipad", scale: "2x" },
  { size: "40x40", idiom: "ipad", scale: "1x" },
  { size: "40x40", idiom: "ipad", scale: "2x" },
  { size: "76x76", idiom: "ipad", scale: "1x" },
  { size: "76x76", idiom: "ipad", scale: "2x" },
  { size: "83.5x83.5", idiom: "ipad", scale: "2x" },
  { size: "1024x1024", idiom: "ios-marketing", scale: "1x" },
  { size: "50x50", idiom: "iphone", scale: "1x" },
  { size: "50x50", idiom: "iphone", scale: "2x" },
  { size: "57x57", idiom: "iphone", scale: "1x" },
  { size: "57x57", idiom: "iphone", scale: "2x" },
  { size: "72x72", idiom: "iphone", scale: "1x" },
  { size: "72x72", idiom: "iphone", scale: "2x" },

  // ------------------ Android sizes ------------------
  { size: "36x36", density: "ldpi" },
  { size: "48x48", density: "mdpi" },
  { size: "72x72", density: "hdpi" },
  { size: "96x96", density: "xhdpi" },
  { size: "144x144", density: "xxhdpi" },
  { size: "192x192", density: "xxxhdpi" },
  { size: "512x512", density: "playstore" },
];

//
// 2. COMPONENT
//
function App() {
  const [image, setImage] = useState(null);        // Data URL of uploaded image
  const [generatedIcons, setGeneratedIcons] = useState([]);
  const [platform, setPlatform] = useState("ios"); // "ios" or "android"
  const toast = useToast();

  //
  // 2.1. Handle user image upload
  //
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  //
  // 2.2. Generate icons (using Canvas)
  //
  const generateIcons = async () => {
    if (!image) {
      toast({
        title: "No image",
        description: "Please upload an image first!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Filter iOS or Android icons
    const filtered = ICON_SIZES.filter((icon) =>
      platform === "ios" ? icon.idiom : icon.density
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const generated = [];

    for (const icon of filtered) {
      const [width, height] = icon.size.split("x").map(Number);

      canvas.width = width;
      canvas.height = height;

      // Instead of `new Image()`, use `document.createElement("img")`
      const img = document.createElement("img");
      img.src = image; // Our base64 data URL

      await new Promise((resolve) => {
        img.onload = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/png");
          generated.push({ ...icon, dataUrl });
          resolve();
        };
      });
    }

    setGeneratedIcons(generated);
    toast({
      title: "Icons generated",
      description: `Successfully generated ${platform} icons!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  //
  // 2.3. Download icons (ZIP)
  //
  const downloadIcons = () => {
    if (generatedIcons.length === 0) {
      toast({
        title: "No icons",
        description: "Generate icons before downloading!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const zip = new JSZip();
    const folderName = platform === "ios" ? "iOSIcons" : "AndroidIcons";
    const folder = zip.folder(folderName);

    generatedIcons.forEach((icon) => {
      let filename = "";
      if (platform === "ios") {
        filename = `Icon-${icon.size}@${icon.scale || "1x"}.png`;
      } else {
        filename = `Icon-${icon.density}.png`;
      }

      const base64Data = icon.dataUrl.split(",")[1];
      folder.file(filename, base64Data, { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${folderName}.zip`);
    });
  };

  //
  // 3. RENDER
  //
  return (
    <Box minH="100vh" bg="gray.800" color="white" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" textAlign="center">
            App Icon Generator
          </Heading>

          <Box bg="gray.700" p={6} rounded="md">
            <Text fontWeight="bold">Upload an image:</Text>
            <Input
              mt={2}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* Preview the uploaded image */}
            {image && (
              <Image
                src={image}
                alt="Uploaded"
                maxW="200px"
                mx="auto"
                my={4}
                border="1px solid white"
              />
            )}

            {/* Platform selection */}
            <Text fontWeight="bold">Select a platform:</Text>
            <RadioGroup onChange={setPlatform} value={platform} mt={2}>
              <Stack direction="row">
                <Radio value="ios">iOS</Radio>
                <Radio value="android">Android</Radio>
              </Stack>
            </RadioGroup>

            {/* Action buttons */}
            <Stack direction="row" spacing={4} mt={6}>
              <Button colorScheme="teal" onClick={generateIcons}>
                Generate Icons
              </Button>
              <Button variant="outline" onClick={downloadIcons}>
                Download Icons
              </Button>
            </Stack>
          </Box>

          {/* Icons Preview */}
          {generatedIcons.length > 0 && (
            <Box bg="gray.700" p={6} rounded="md">
              <Text fontWeight="bold" mb={4}>
                Preview
              </Text>
              <Grid
                templateColumns="repeat(auto-fill, minmax(80px, 1fr))"
                gap={4}
              >
                {generatedIcons.map((icon, i) => (
                  <GridItem key={i} textAlign="center">
                    <Image
                      src={icon.dataUrl}
                      alt={icon.size}
                      mx="auto"
                      border="1px solid white"
                    />
                    <Text mt={2} fontSize="sm">
                      {platform === "ios"
                        ? `${icon.size}@${icon.scale || "1x"}`
                        : icon.density}
                    </Text>
                  </GridItem>
                ))}
              </Grid>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
