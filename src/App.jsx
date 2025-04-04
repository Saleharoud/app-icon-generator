
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
import { motion } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";


const ICON_SIZES = [
  // ------------------ iOS sizes (New) ------------------
  { size: "40x40", idiom: "universal", scale: "2x" },    // 20pt
  { size: "60x60", idiom: "universal", scale: "3x" },    // 20pt
  { size: "58x58", idiom: "universal", scale: "2x" },    // 29pt
  { size: "87x87", idiom: "universal", scale: "3x" },    // 29pt
  { size: "76x76", idiom: "universal", scale: "2x" },    // 38pt
  { size: "114x114", idiom: "universal", scale: "3x" },   // 38pt
  { size: "80x80", idiom: "universal", scale: "2x" },    // 40pt
  { size: "120x120", idiom: "universal", scale: "3x" },   // 40pt
  { size: "120x120", idiom: "universal", scale: "2x" },   // 60pt
  { size: "180x180", idiom: "universal", scale: "3x" },   // 60pt
  { size: "128x128", idiom: "universal", scale: "2x" },   // 64pt
  { size: "192x192", idiom: "universal", scale: "3x" },   // 64pt
  { size: "136x136", idiom: "universal", scale: "2x" },   // 68pt
  { size: "152x152", idiom: "universal", scale: "2x" },   // 76pt
  { size: "167x167", idiom: "universal", scale: "2x" },   // 83.5pt
  { size: "1024x1024", idiom: "ios-marketing", scale: "1x" }, // App Store

  // ------------------ Android sizes ------------------
  { size: "36x36", density: "ldpi" },
  { size: "48x48", density: "mdpi" },
  { size: "72x72", density: "hdpi" },
  { size: "96x96", density: "xhdpi" },
  { size: "144x144", density: "xxhdpi" },
  { size: "192x192", density: "xxxhdpi" },
  { size: "512x512", density: "playstore" },
];


const MotionBox = motion(Box);
const MotionHeading = motion(Heading);

function App() {
  const [image, setImage] = useState(null);
  const [generatedIcons, setGeneratedIcons] = useState([]);
  const [platform, setPlatform] = useState("ios");
  const toast = useToast();

 
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

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

    const filtered = ICON_SIZES.filter((icon) =>
      platform === "ios" ? icon.idiom : icon.density
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const results = [];

    for (const icon of filtered) {
      const [width, height] = icon.size.split("x").map(Number);

      canvas.width = width;
      canvas.height = height;

      const img = document.createElement("img");
      img.src = image;

      await new Promise((resolve) => {
        img.onload = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/png");
          results.push({ ...icon, dataUrl });
          resolve();
        };
      });
    }

    setGeneratedIcons(results);
    toast({
      title: "Icons generated",
      description: `Successfully generated ${platform} icons!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

 
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

  return (
    <MotionBox
      bgGradient="linear(to-r, gray.900 0%, gray.800 50%, gray.900 100%)"
      animate={{
        backgroundPosition: ["0% 0%", "200% 0%"], 
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      minH="100vh"
      color="white"
      py={8}
      px={4}
    >
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          <MotionHeading
            as="h1"
            textAlign="center"
            bgGradient="linear(to-r, cyan.400, pink.400)"
            bgClip="text"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            fontSize={["3xl", "4xl", "5xl"]}
            textShadow="0 0 20px rgba(255, 0, 255, 0.7)"
          >
            App Icon Generator
          </MotionHeading>

          <MotionBox
            bg="whiteAlpha.100"
            p={6}
            rounded="md"
            boxShadow="0 0 20px rgba(0, 255, 255, 0.1)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            whileHover={{
              boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)",
            }}
          >
            <Text fontWeight="bold">Upload an image:</Text>
            <Input
              mt={2}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              border="1px solid"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: "pink.300" }}
            />

            {image && (
              <MotionBox
                mt={4}
                display="flex"
                justifyContent="center"
                alignItems="center"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src={image}
                  alt="Uploaded"
                  maxW="200px"
                  border="1px solid white"
                  borderRadius="md"
                />
              </MotionBox>
            )}

            <Text fontWeight="bold" mt={4}>
              Select a platform:
            </Text>
            <RadioGroup onChange={setPlatform} value={platform} mt={2}>
              <Stack direction="row" spacing={6}>
                <Radio value="ios">iOS</Radio>
                <Radio value="android">Android</Radio>
              </Stack>
            </RadioGroup>

            <Stack direction="row" spacing={4} mt={6}>
              <Button
                onClick={generateIcons}
                bgGradient="linear(to-r, teal.400, green.400)"
                _hover={{ bgGradient: "linear(to-r, teal.300, green.300)" }}
                color="white"
                boxShadow="0 0 10px rgba(0,255,0,0.3)"
              >
                Generate Icons
              </Button>
              <Button
                variant="outline"
                colorScheme="pink"
                onClick={downloadIcons}
                _hover={{
                  boxShadow: "0 0 15px rgba(255,0,255,0.5)",
                }}
              >
                Download Icons
              </Button>
            </Stack>
          </MotionBox>

          {generatedIcons.length > 0 && (
            <MotionBox
              bg="whiteAlpha.100"
              p={6}
              rounded="md"
              boxShadow="0 0 20px rgba(255, 0, 255, 0.1)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Text fontWeight="bold" mb={4}>
                Preview
              </Text>
              <Grid templateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={4}>
                {generatedIcons.map((icon, i) => (
                  <MotionBox
                    key={i}
                    textAlign="center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image
                      src={icon.dataUrl}
                      alt={icon.size}
                      mx="auto"
                      border="1px solid white"
                      borderRadius="md"
                    />
                    <Text mt={2} fontSize="sm">
                      {platform === "ios"
                        ? `${icon.size}@${icon.scale || "1x"}`
                        : icon.density}
                    </Text>
                  </MotionBox>
                ))}
              </Grid>
            </MotionBox>
          )}
        </VStack>
      </Container>
    </MotionBox>
  );
}

export default App;
