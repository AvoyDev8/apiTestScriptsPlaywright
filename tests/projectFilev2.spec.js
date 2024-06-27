import { test, expect } from "@playwright/test";
// import jsonUpates from "../genericFunction/jsonUpdate";
const jsonData = require("../jsonFiles/credData.json");
const fs = require("fs");
const path = require("path");
const updatejsonfile = require("../genericFunction/jsonUpdate");

//R-128605
// let serverreqID;

// test("TC_01 Login kay gen", async ({ request }) => {
//   const loginData = await request.post("api/auth/iem/login", {
//     headers: {
//       contentType: "application/json",
//     },
//     data: {
//       email: jsonData.email,
//       password: jsonData.password,
//     },
//   });

//   let loginJson = await loginData.json();
//   updatejsonfile("Authorization", `Bearer ${loginJson.data.accessToken}`);
//   console.log("Access token ==>" + "ttt" + "    " + loginJson.data.accessToken);
// });

test("TC 02 Create request", async ({ request }) => {
  const createRequest = await request.post("api/v2/request/create", {
    headers: {
      Authorization: jsonData.Authorization,
      "Content-Type": jsonData.contentType,
    },
    data: {
      request_type: "quote",
      project_type: "translation",
    },
  });

  const responseJson = await createRequest.json();
  const serverreqID = responseJson.data.serverRequestId;
  console.log("req id ==>" + serverreqID);

  //update json file
  updatejsonfile("serverMainId", serverreqID);

  //file upload
  const uploadFile_1 = path.resolve(
    "resourceFiles/DemoDoc.docx"
  );
  const uploadFile_2 = path.resolve(
    "resourceFiles/TestFile_1.pdf"
  );

  //file sync
  const docxData = fs.readFileSync(uploadFile_1);
  const pdfData = fs.readFileSync(uploadFile_2);

  const fileUpload_1 = await request.post(
    "api/v2/projectfile/chunkedfileupload",
    {
      headers: {
        Authorization: jsonData.Authorization,
      },
      multipart: {
        File: {
          name: uploadFile_1,
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          buffer: docxData,
        },
        serverMainId: jsonData.serverMainId,
        TotalNumberOfChunks: 1,
        TotalSize: 12907,
        CurrentChunkNumber: 1,
        CurrentChunkSize: 12907,
        crc: "49d5bd54",
        FolderType: 2,
        FilePathName: "eng",
        TotalCrc: "49d5bd54",
      },
    }
  );

  console.log("File upload 1 " + fileUpload_1.status());

  const fileUpload_2 = await request.post(
    "api/v2/projectfile/chunkedfileupload",
    {
      headers: {
        Authorization: jsonData.Authorization,
      },
      multipart: {
        File: {
          name: uploadFile_2,
          mimeType: "application/pdf",
          buffer: pdfData,
        },
        serverMainId: jsonData.serverMainId,
        TotalNumberOfChunks: 1,
        TotalSize: 70011,
        CurrentChunkNumber: 1,
        CurrentChunkSize: 70011,
        crc: "c4d6c2b7",
        FolderType: 2,
        FilePathName: "eng",
        TotalCrc: "c4d6c2b7",
      },
    }
  );

  console.log("File upload 1 " + fileUpload_2.status());
});

test("TC 03 File count in source folder", async ({ request }) => {

  const fileCountResp = await request.get(
    "api/v2/projectfile/file-count-in-folder?serverMainId=" +
      jsonData.serverMainId +
      "&folderType=2",
    {
      headers: {
        Authorization: jsonData.Authorization,
        contentType: jsonData.contentType,
      },
    }
  );
  let responseJson = await fileCountResp.json();
  console.log(
    "File count in source folder data===> " + JSON.stringify(responseJson)
  );
  console.log("stat==>" + fileCountResp.status());
  console.log("File count ==>" + responseJson.data);

  expect(responseJson.data).toBe(2);
});

//server file count
test("TC 04 Server file count ", async ({ request }) => {
  const fileInServerCount = await request.get(
    "api/v2/projectfile/file-count-from-server?serverMainId=" +
      jsonData.serverMainId +
      "&source_file_type=2&reference_file_type=1",
    {
      headers: {
        Authorization: jsonData.Authorization,
        contentType: jsonData.contentType,
      },
    }
  );
  //let fileCnt=
  expect(fileInServerCount.status()).toBe(200);
  expect(fileInServerCount.status()).toBe(200);

  const responseJson = await fileInServerCount.json();
  console.log(
    "File count in source folder data===> " + JSON.stringify(responseJson)
  );
  console.log("stat==>" + fileInServerCount.status());
  console.log("File count ==>" + responseJson.data.reference_file_count);

  expect(responseJson.data.reference_file_count).toBe(0);
});

//file count

test("TC 04 File count cq connect folder", async ({ request }) => {
  let fileCountResp = await request.get(
    "api/v2/projectfile/cqconnect-file-count-in-folder?serverMainId=" +
      jsonData.serverMainId +
      "&folderType=2",
    {
      headers: {
        Authorization: jsonData.Authorization,
        contentType: jsonData.contentType,
      },
    }
  );
  let responseJson = await fileCountResp.json();
  console.log(
    "File count in source folder data===> " + JSON.stringify(responseJson)
  );
  console.log("stat==>" + fileCountResp.status());
  console.log("File count ==>" + responseJson.data);

  expect(responseJson.data).toBe(2);
});

//File upload
test("TC 05 File upload", async ({ request }) => {
  const uploadFile_1 = path.resolve(
    "resourceFiles/greeting.pdf"
  );

  //file sync
  const pdfData = fs.readFileSync(uploadFile_1);
  const fileUpload_1 = await request.post("api/v2/projectfile/file-uploads", {
    headers: {
      Authorization: jsonData.Authorization,
    },
    multipart: {
      File: {
        name: uploadFile_1,
        mimeType: "application/pdf",
        buffer: pdfData,
      },
    },
  });
});

//Copy file --- for referance folder
test("TC 06 CopyFile ", async ({ request }) => {
  
  const copyFile = await request.post("api/v2/projectfile/cqconnect-copy-file", {
    headers: {
      Authorization: jsonData.Authorization,
      contentType: jsonData.contentType,
    },
    data: {
      serverMainId: 124961,
      folder_type: 1,
      files_name: ["c'est un fichier.pdf"],
      source_folder: "urd",
      destination_folder: "hin",
    },
  });
});

test("TC 07 delete request", async ({ request }) => {
  const deleteRequest = await request.delete(
    "api/v2/request/delete-request?serverRequestId=" +
      jsonData.serverMainId +
      "",
    {
      headers: {
        Authorization: jsonData.Authorization,
        "Content-Type": jsonData.contentType,
      },
    }
  );
  updatejsonfile("serverMainId", null);
  console.log("req id ==>" + jsonData.serverMainId);

  let responseJson = await deleteRequest.json();

  console.log("delete status ==>" + deleteRequest.status());
});
