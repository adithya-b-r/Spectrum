import React, { useState } from 'react';
import { toast } from 'react-toastify';

export const CreatePost: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [sections, setSections] = useState<{ type: string; content: string | null }[]>([]);

  // Add a new section
  const addSection = (type: string) => {
    setSections([...sections, { type, content: type === 'text' ? '' : null }]);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  // Handle text change
  const handleTextChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].content = value;
    setSections(newSections);
  };

  // Image upload
  const handleImageChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSections = [...sections];
        newSections[index].content = reader.result as string;
        setSections(newSections);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  // const publishPost = () => {
  //   console.log("Post published:", { title, sections });
  //   toast.success("Uploaded Post Successfully!");
  //   setSections([]);
  //   setTitle('');
  // };

  const publishPost = async () => {
    var user = "67749a7f8adb01f752b2fb47"

    if (!title.trim() || sections.length === 0) {
      toast.error('Please add a title and at least one section.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/blogs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content: sections, author: user}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish post');
      }

      const result = await response.json();
      toast.success('Post uploaded successfully!');
      console.log('Post published:', result);

      setTitle('');
      setSections([]);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };


  return (
    <div className="w-full h-screen p-5 bg-gray-100">
      <h1 className="md:text-4xl text-2xl font-bold text-center mb-8">New Post</h1>

      <div className="flex flex-col font-semibold bg-white rounded-lg shadow-md p-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="p-3 w-full rounded-md focus:outline-none border-2 border-gray-300 mb-4"
        />
        {sections.length === 0 ? (
          <p className="text-gray-500 mb-4">No sections added yet. Use the buttons below to add content.</p>
        ) : (
          sections.map((section, index) => (
            <div key={index} className="mb-4 p-4 border flex items-center w-full justify-center rounded-lg">
              <div className="flex-col w-full justify-between items-center">
                <div className="flex-grow ">
                  {section.type === 'text' ? (
                    <textarea
                      rows={4}
                      placeholder="Content"
                      value={section.content || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="w-full rounded-md focus:outline-none border-gray-300 resize-none mb-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      {section.content ? (
                        <img
                          src={section.content}
                          alt="Preview"
                          className="w-full max-w-[720px] h-auto border border-gray-300 rounded-md"
                        />
                      ) : (
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                          <p className="text-gray-500 text-center">No image selected. Click "Add Image" to upload.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-center">
                  {section.type === 'image' && (
                    <label className="cursor-pointer flex items-center p-2 text-blue-600 hover:opacity-80">
                      <i className='bx bx-image-add mr-1 text-2xl md:text-4xl'></i>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(index, e)}
                      />
                    </label>
                  )}
                  <button
                    onClick={() => removeSection(index)}
                    className="flex items-center p-2 text-red-600 hover:opacity-80"
                  >
                    <i className='bx bx-trash mr-1 text-2xl md:text-4xl'></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="w-full flex items-center justify-center gap-5 mb-4">
          <button
            onClick={() => addSection('text')}
            className="mt-4 p-2 rounded-md border-2 border-gray-400 font-semibold hover:bg-gray-200"
          >
            Add Text
          </button>
          <button
            onClick={() => addSection('image')}
            className="mt-4 p-2 rounded-md border-2 border-gray-400 font-semibold hover:bg-gray-200"
          >
            Add Image
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={publishPost}
            className="mt-4 px-5 py-2 tracking-wider rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Publish Post
          </button>
        </div>
      </div>
    </div>
  );
};