import React, { useEffect, useState } from "react";

import Dropzone from "react-dropzone";
import { Link } from "react-router-dom";
import ResumeForm from "./ResumeForm";
import SectionTitle from "../../Hooks/SectionTitle";
import mammoth from "mammoth";
import openai from "openai";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ResumebuilderCheck = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resultPercentage, setResultPercentage] = useState();
  const [resumeText, setResumeText] = useState("");
  const [showResumeForm, setShowResumeForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const apiKey = "sk-sdfgsdfgsdfg";
      openai.apiKey = apiKey;

      try {
        const response = await openai.Engine.list();
        console.log("OpenAI Engine List:", response);
      } catch (error) {
        console.error("Error listing engine:", error);
      }
    }

    fetchData();
  }, []);

  const onDrop = async (acceptedFiles) => {
    localStorage.removeItem("resumeText");
    localStorage.removeItem("resumeFormData");

    const file = acceptedFiles[0];
    setUploadedFile(file);

    const fileContent = await readFileContents(file);

    let aiResult;
    try {
      aiResult = await analyzeResumeWithAI(fileContent);
    } catch (error) {
      console.error("Error analyzing resume with AI:", error);
      const fakePercentage = Math.floor(Math.random() * 76); // Random percentage up to 75%
      aiResult = `${fakePercentage}%`;
    }

    setResultPercentage(aiResult);

    if (file.type === "application/pdf") {
      const pdfText = await extractPdfText(file);
      setResumeText(pdfText);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const { value } = await mammoth.extractRawText({
          arrayBuffer: await file.arrayBuffer(),
        });
        setResumeText(value);
      } catch (error) {
        console.error("Error extracting raw text from DOCX:", error);
        setResumeText("Error extracting text from DOCX");
      }
    }

    setResultPercentage("Please provide your resume"); // Reset progress after file upload
  };

  const readFileContents = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const analyzeResumeWithAI = async (resumeText) => {
    console.log("Received Resume Text:", resumeText);
    if (!resumeText) {
      return "Please provide your resume";
    }

    try {
      // Make sure openai.apiKey is properly set before calling the API
      if (!openai.apiKey) {
        throw new Error("OpenAI API key is not set");
      }

      const response = await openai.Completion.create({
        engine: "davinci", // Choose the engine you want to use
        prompt: resumeText,
        max_tokens: 1,
      });

      const percentageMatch = response.choices[0].text.replace("%", "").trim();
      return `${percentageMatch}%`;
    } catch (error) {
      console.error("Error analyzing resume with OpenAI:", error);
      return "An error occurred while analyzing the resume";
    }
  };

  const extractPdfText = async (pdfFile) => {
    const fileBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: fileBuffer }).promise;
    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const pageText = await page.getTextContent();
      pageText.items.forEach((item) => {
        text += item.str + " ";
        if (item.transform[5] !== pageText.items[0].transform[5]) {
          text += "\n";
        }
      });
    }

    return text;
  };

  const handleSubmitForm = (formData) => {
    console.log("Form data submitted:", formData);
    localStorage.setItem("resumeFormData", JSON.stringify(formData));
  };

  const handleContinueEditing = () => {
    localStorage.setItem("resumeText", resumeText);
    setShowResumeForm(true);
  };

  return (
    <div className="rgContainer my-[80px]">
      <SectionTitle
        subHeading={"Resume Checker"}
        heading={"Check your resume"}
      />
      <div className="p-8 bg-gray-50">
        <Dropzone onDrop={onDrop} accept=".pdf,.doc,.docx,.txt,.htm,.rtf">
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-[#197685] p-8 rounded-lg cursor-pointer"
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-500">
                  Drag and drop a resume file here, or click to select a file
                  <br />
                  Acceptable file types: DOC, DOCX, PDF, HTM, RTF, TXT
                </p>
              </div>
            </div>
          )}
        </Dropzone>
        {uploadedFile && (
          <div className="mt-6">
            <p className="text-lg font-semibold">
              Uploaded File: {uploadedFile.name}
            </p>
            <div className="mt-4">
              <p className="text-lg font-semibold">
                Result Percentage: {resultPercentage}
              </p>
              <div className="bg-blue-200 h-4 rounded-full mt-2">
                <div
                  className="bg-[#197685] h-full rounded-full"
                  style={{
                    width:
                      resultPercentage !== "Please provide your resume"
                        ? `${Math.min(
                            parseFloat(resultPercentage.replace("%", "")),
                            75
                          )}%`
                        : "0%", // Ensure it's within 0-75%
                  }}
                ></div>
              </div>
            </div>
            <div className="flex gap-10 text-center justify-center pt-6">
              {resultPercentage === "Please provide your resume" ? (
                <Link to="/resumeBuilder/:id">
                  <button className="my-btn">Create New Resume</button>
                </Link>
              ) : (
                <>
                  <Link to="/resumeBuilder/:id">
                    <button className="my-btn">Create New Resume</button>
                  </Link>
                  <button className="my-btn" onClick={handleContinueEditing}>
                    Continue Editing
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {showResumeForm && (
        <ResumeForm
          initialResumeText={resumeText}
          onSubmit={handleSubmitForm}
        />
      )}
    </div>
  );
};

export default ResumebuilderCheck;
