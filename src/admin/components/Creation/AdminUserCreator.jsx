import React from 'react';
import { User, Users, Mail, Phone, Lock, GraduationCap } from 'lucide-react';
import axios from '../../../axiosConfig';

const AdminUserCreator = () => {
  const [formData, setFormData] = React.useState({
    studentName: "",
    studentUsername: "",
    studentPassword: "",
    studentEmail: "",
    studentPhoneNumber: "",
    studentClassId: "",
    parentUsername: "",
    parentPassword: "",
    motherName: "",
    motherEmail: "",
    motherPhoneNumber: "",
    fatherName: "",
    fatherEmail: "",
    fatherPhoneNumber: "",
  });

  const [classes, setClasses] = React.useState([]);
  const [message, setMessage] = React.useState(null);

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setMessage({ type: "error", text: "Nu s-au putut prelua clasele." });
      }
    };

    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (name === "studentName") {
        const usernameBase = value.trim().toLowerCase().replace(/\s+/g, "_");
        updatedForm.studentUsername = `${usernameBase}.stud`;
        updatedForm.parentUsername = `${usernameBase}.parent`;
      }
      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = window.confirm(
      `Sigur dorești să creezi utilizatorii:\n\nStudent: ${formData.studentUsername}\nPărinte: ${formData.parentUsername}`
    );
    if (!confirm) return;

    try {
      await axios.post("/users/register-with-parent", {
        student: {
          username: formData.studentUsername,
          password: formData.studentPassword,
          name: formData.studentName,
          email: formData.studentEmail,
          phoneNumber: formData.studentPhoneNumber,
          studentClass: { id: parseInt(formData.studentClassId) },
          parent: {
            username: formData.parentUsername,
            password: formData.parentPassword,
            motherName: formData.motherName,
            motherEmail: formData.motherEmail,
            motherPhoneNumber: formData.motherPhoneNumber,
            fatherName: formData.fatherName,
            fatherEmail: formData.fatherEmail,
            fatherPhoneNumber: formData.fatherPhoneNumber,
          },
        },
      });

      setMessage({ type: "success", text: "Student și părinte creați cu succes!" });
      setFormData({
        studentName: "",
        studentUsername: "",
        studentPassword: "",
        studentEmail: "",
        studentPhoneNumber: "",
        studentClassId: "",
        parentUsername: "",
        parentPassword: "",
        motherName: "",
        motherEmail: "",
        motherPhoneNumber: "",
        fatherName: "",
        fatherEmail: "",
        fatherPhoneNumber: "",
      });
    } catch (error) {
      console.error("Error creating users:", error);
      setMessage({
        type: "error",
        text: "Eroare la crearea utilizatorilor. Verificați datele introduse.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b">
          <h2 className="text-lg font-semibold">Creează utilizatori</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50/50 text-green-600 border border-green-200"
                  : "bg-red-50/50 text-red-600 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Secțiunea detalii student */}
            <fieldset className="space-y-4">
              <legend className="text-base font-medium text-gray-900 border-b pb-2">Detalii Student</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={User}
                  type="text"
                  name="studentName"
                  placeholder="Nume Student"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  icon={User}
                  type="text"
                  name="studentUsername"
                  placeholder="Username Student"
                  value={formData.studentUsername}
                  readOnly
                />
                <InputField
                  icon={Lock}
                  type="password"
                  name="studentPassword"
                  placeholder="Parolă Student"
                  value={formData.studentPassword}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  icon={Mail}
                  type="email"
                  name="studentEmail"
                  placeholder="Email Student"
                  value={formData.studentEmail}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  icon={Phone}
                  type="text"
                  name="studentPhoneNumber"
                  placeholder="Telefon Student"
                  value={formData.studentPhoneNumber}
                  onChange={handleInputChange}
                  required
                />
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <select
                    name="studentClassId"
                    className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.studentClassId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selectează o clasă</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (ID: {cls.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Secțiunea detalii părinte */}
            <fieldset className="space-y-4">
              <legend className="text-base font-medium text-gray-900 border-b pb-2">Detalii Părinte</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={User}
                  type="text"
                  name="parentUsername"
                  placeholder="Username Părinte"
                  value={formData.parentUsername}
                  readOnly
                />
                <InputField
                  icon={Lock}
                  type="password"
                  name="parentPassword"
                  placeholder="Parolă Părinte"
                  value={formData.parentPassword}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  icon={User}
                  type="text"
                  name="motherName"
                  placeholder="Nume Mamă"
                  value={formData.motherName}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Mail}
                  type="email"
                  name="motherEmail"
                  placeholder="Email Mamă"
                  value={formData.motherEmail}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Phone}
                  type="text"
                  name="motherPhoneNumber"
                  placeholder="Telefon Mamă"
                  value={formData.motherPhoneNumber}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={User}
                  type="text"
                  name="fatherName"
                  placeholder="Nume Tată"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Mail}
                  type="email"
                  name="fatherEmail"
                  placeholder="Email Tată"
                  value={formData.fatherEmail}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Phone}
                  type="text"
                  name="fatherPhoneNumber"
                  placeholder="Telefon Tată"
                  value={formData.fatherPhoneNumber}
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
            >
              <Users className="mr-2 h-4 w-4" />
              Creează Utilizatori
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
    <input
      {...props}
      className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
);

export default AdminUserCreator;
