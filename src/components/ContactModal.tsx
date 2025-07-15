import { useForm } from 'react-hook-form';

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormValues = { name: string; email: string; message: string };
function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: { name: string; email: string; message: string }) => {
    try {
      const res = await fetch('/api/transactions/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        alert('Message sent!');
        onClose();
      } else {
        alert('Failed to send message. Please try again later.');
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="font-arial fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="font-arial uppercase bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-3xl mb-7 font-bold">Contact Us</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label htmlFor="name" className="font-arial block mb-1 font-medium">Name:</label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="font-arial w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}

          <label htmlFor="email" className="font-arial uppercase block mb-1 font-medium">Email:</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className="font-arial w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}


          <label htmlFor="message" className="font-arial uppercase block mb-1 font-medium">Message:</label>
          <textarea
            id="message"
            {...register('message', { required: 'Message is required' })}
            className="font-arial w-full border border-gray-300 rounded px-3 py-2"
          ></textarea>
          {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>}

          <div className="flex justify-end space-x-2">
            <button type="submit" className="font-arial uppercase bg-black text-white px-4 py-2 font-bold rounded hover:bg-gray-800 cursor-pointer">Submit</button>
            <button type="button" onClick={onClose} className="font-arial uppercase border border-gray-400 px-4 py-2 rounded hover:bg-gray-100 cursor-pointer font-bold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;