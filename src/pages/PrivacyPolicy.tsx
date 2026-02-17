import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import starlogsIcon from "@/assets/starlogs-icon.png";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <img src={starlogsIcon} alt="StarLogs" className="w-6 h-6" />
            <span className="font-display font-semibold text-foreground">StarLogs</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="glass-card rounded-xl p-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
          
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground/90">
            <p>
              This privacy policy is applicable to the StarLogs app (hereinafter referred to as "Application") for mobile devices, which was developed by Arnold Oyoo (hereinafter referred to as "Service Provider") as a Free service. This service is provided "AS IS".
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">What information does the Application obtain and how is it used?</h2>
            
            <h3 className="text-lg font-medium text-foreground">What information do users provide to the Application?</h3>
            <p>
              The Application acquires the information you supply when you download and register the Application. Registration with the Service Provider is not mandatory. However, bear in mind that you might not be able to utilize some of the features offered by the Application unless you register with them.
            </p>
            <p>
              The Service Provider may also use the information you provided them to contact you from time to time to provide you with important information, required notices and marketing promotions.
            </p>

            <h3 className="text-lg font-medium text-foreground">What information does the Application collect automatically?</h3>
            <p>
              In addition, the Application may collect certain information automatically, including, but not limited to, the type of mobile device you use, your mobile devices unique device ID, the IP address of your mobile device, your mobile operating system, the type of mobile Internet browsers you use, and information about the way you use the Application.
            </p>

            <h3 className="text-lg font-medium text-foreground">Does the Application collect precise real time location information of the device?</h3>
            <p>
              This Application collects your device's location, which helps the Service Provider determine your approximate geographical location and make use of in below ways:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Geolocation Services:</strong> The Service Provider utilizes location data to provide features such as personalized content, relevant recommendations, and location-based services.</li>
              <li><strong>Analytics and Improvements:</strong> Aggregated and anonymized location data helps the Service Provider to analyze user behavior, identify trends, and improve the overall performance and functionality of the Application.</li>
              <li><strong>Third-Party Services:</strong> Periodically, the Service Provider may transmit anonymized location data to external services. These services assist them in enhancing the Application and optimizing their offerings.</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground">Does the Application use Artificial Intelligence (AI) technologies?</h3>
            <p>
              The Application does not use Artificial Intelligence (AI) technologies to process your data or provide features.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">Do third parties see and/or have access to information obtained by the Application?</h2>
            <p>
              Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
            </p>
            <p>
              Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
            </p>
            <ul className="list-disc pl-6">
              <li><a href="https://www.google.com/policies/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Play Services</a></li>
            </ul>
            <p>The Service Provider may disclose User Provided and Automatically Collected Information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>as required by law, such as to comply with a subpoena, or similar legal process;</li>
              <li>when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;</li>
              <li>with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8">What are my opt-out rights?</h2>
            <p>
              You can halt all collection of information by the Application easily by uninstalling the Application. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">What is the data retention policy and how can you manage your information?</h2>
            <p>
              The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. The Service Provider will retain Automatically Collected information for up to 24 months and thereafter may store it in aggregate. If you'd like the Service Provider to delete User Provided Data that you have provided via the Application, please contact them at <a href="mailto:oyooart@outlook.com" className="text-primary hover:underline">oyooart@outlook.com</a> and we will respond in a reasonable time. Please note that some or all of the User Provided Data may be required in order for the Application to function properly.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">How does the Application address children's privacy?</h2>
            <p>
              The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
            </p>
            <p>
              The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider (<a href="mailto:oyooart@outlook.com" className="text-primary hover:underline">oyooart@outlook.com</a>) so that they will be able to take the necessary actions.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">How is your information kept secure?</h2>
            <p>
              The Service Provider are concerned about safeguarding the confidentiality of your information. The Service Provider provide physical, electronic, and procedural safeguards to protect information we process and maintain. For example, we limit access to this information to authorized employees and contractors who need to know that information in order to operate, develop or improve their Application. Please be aware that, although we endeavor provide reasonable security for information we process and maintain, no security system can prevent all potential security breaches.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">How will you be informed of changes to this Privacy Policy?</h2>
            <p>
              This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
            </p>
            <p><strong>This privacy policy is effective as of 2026-01-20</strong></p>

            <h2 className="text-xl font-semibold text-foreground mt-8">How do you give your consent?</h2>
            <p>
              By using the Application, you are giving your consent to the Service Provider processing of your information as set forth in this Privacy Policy now and as amended by us. "Processing," means using cookies on a computer/hand held device or using or touching information in any way, including, but not limited to, collecting, storing, deleting, using, combining and disclosing information.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">How can you contact us?</h2>
            <p>
              If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at <a href="mailto:oyooart@outlook.com" className="text-primary hover:underline">oyooart@outlook.com</a>.
            </p>

            <hr className="my-6 border-border" />
            <p className="text-xs text-muted-foreground">
              This privacy policy page was generated by <a href="https://app-privacy-policy-generator.nisrulz.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">App Privacy Policy Generator</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
